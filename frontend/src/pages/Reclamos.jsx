import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, ShieldCheck, WalletCards } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { hasRole } from '../auth/accessControl.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  createInPersonClaim,
  getClaimPrivacyNotice,
  getInPersonClaimSender,
  listClaims,
} from '../services/reclamosService.js';

const CATEGORIES = [
  ['DANO', 'Daño'], ['PERDIDA', 'Pérdida'], ['FALTANTE', 'Faltante'], ['RETRASO', 'Retraso'],
  ['ENTREGA', 'Entrega'], ['COBRO', 'Cobro'], ['ATENCION', 'Atención'], ['OTRO', 'Otro'],
];
const STATUS_LABELS = {
  RECIBIDO: 'Recibido', EN_REVISION: 'En revisión', ESPERANDO_INFORMACION: 'Esperando información',
  INVESTIGANDO: 'Investigando', PROPUESTA_ENVIADA: 'Solución propuesta',
  PAGO_POR_VERIFICAR: 'Pago por verificar', RESUELTO: 'Resuelto', NO_PROCEDE: 'No procede', CERRADO: 'Cerrado',
};
const EMPTY_FORM = {
  shipment_code: '', claimant_document_number: '',
  category: 'DANO', description: '', contact_phone: '', contact_email: '',
};
const EMPTY_SHIPMENT_LOOKUP = { loading: false, error: '', message: '' };

function normalizeShipmentCode(value) {
  return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function Reclamos({ agencyId, agencyName = 'Agencia', caseBasePath }) {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [shipmentLookup, setShipmentLookup] = useState(EMPTY_SHIPMENT_LOOKUP);
  const shipmentLookupSequence = useRef(0);
  const senderLookupCode = useRef('');
  const senderLookupInFlight = useRef('');
  const shipmentLookupTimer = useRef(null);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canCreate = hasRole(user, ['ADMIN_GENERAL', 'AGENCY_ADMIN', 'SECRETARIA']);

  const loadClaims = useCallback(async () => {
    if (!agencyId) return;
    try {
      setLoading(true);
      setError('');
      setClaims(await listClaims({ agencyId, ...filters }));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudieron cargar los reclamos de esta agencia.'));
    } finally {
      setLoading(false);
    }
  }, [agencyId, filters]);

  useEffect(() => { void loadClaims(); }, [loadClaims]);
  useEffect(() => {
    getClaimPrivacyNotice().then((result) => {
      setNotice(result);
    }).catch(() => setNotice(null));
  }, []);

  function handleShipmentCodeChange(event) {
    const shipmentCode = event.target.value;
    const normalizedCode = normalizeShipmentCode(shipmentCode);
    if (shipmentLookupTimer.current) clearTimeout(shipmentLookupTimer.current);
    shipmentLookupSequence.current += 1;
    if (normalizedCode !== senderLookupCode.current) senderLookupCode.current = '';
    setForm((current) => ({
      ...current,
      shipment_code: shipmentCode,
      claimant_document_number: '',
    }));
    setShipmentLookup(EMPTY_SHIPMENT_LOOKUP);
    if (normalizedCode.length >= 8) {
      shipmentLookupTimer.current = setTimeout(() => {
        shipmentLookupTimer.current = null;
        void lookupShipmentSender(shipmentCode);
      }, 350);
    }
  }

  async function lookupShipmentSender(rawShipmentCode = form.shipment_code) {
    if (shipmentLookupTimer.current) {
      clearTimeout(shipmentLookupTimer.current);
      shipmentLookupTimer.current = null;
    }
    const shipmentCode = normalizeShipmentCode(rawShipmentCode);
    if (!agencyId || shipmentCode.length < 8) return;
    if (senderLookupCode.current === shipmentCode && form.claimant_document_number) return;
    if (senderLookupInFlight.current === shipmentCode) return;

    const requestSequence = ++shipmentLookupSequence.current;
    senderLookupInFlight.current = shipmentCode;
    setShipmentLookup({ loading: true, error: '', message: '' });
    try {
      const sender = await getInPersonClaimSender(agencyId, shipmentCode);
      if (requestSequence !== shipmentLookupSequence.current) return;
      setForm((current) => (
        normalizeShipmentCode(current.shipment_code) === shipmentCode
          ? { ...current, shipment_code: shipmentCode, claimant_document_number: sender.sender_document_number }
          : current
      ));
      senderLookupCode.current = shipmentCode;
      setShipmentLookup({ loading: false, error: '', message: 'Documento del remitente completado. Puedes cambiarlo si el caso corresponde al destinatario.' });
    } catch (lookupError) {
      if (requestSequence !== shipmentLookupSequence.current) return;
      setForm((current) => (
        normalizeShipmentCode(current.shipment_code) === shipmentCode
          ? { ...current, claimant_document_number: '' }
          : current
      ));
      setShipmentLookup({
        loading: false,
        error: getApiErrorMessage(lookupError, 'No se encontró la encomienda en esta agencia.'),
        message: '',
      });
    } finally {
      if (senderLookupInFlight.current === shipmentCode) senderLookupInFlight.current = '';
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!agencyId || !privacyAcknowledged) return;
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const created = await createInPersonClaim({
        ...form,
        agency_id: Number(agencyId),
        privacy_notice_acknowledged: privacyAcknowledged,
      });
      setMessage(`Caso ${created.case_code} ingresado en ${agencyName}.`);
      setForm(EMPTY_FORM);
      shipmentLookupSequence.current += 1;
      senderLookupCode.current = '';
      senderLookupInFlight.current = '';
      if (shipmentLookupTimer.current) clearTimeout(shipmentLookupTimer.current);
      shipmentLookupTimer.current = null;
      setShipmentLookup(EMPTY_SHIPMENT_LOOKUP);
      setPrivacyAcknowledged(false);
      setShowForm(false);
      await loadClaims();
    } catch (createError) {
      setError(getApiErrorMessage(createError, 'No se pudo ingresar el reclamo presencial.'));
    } finally {
      setSaving(false);
    }
  }

  const visibleClaims = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return claims;
    return claims.filter((claim) => [claim.case_code, claim.shipment_id, claim.category, claim.claimant_name]
      .some((value) => String(value || '').toLowerCase().includes(term)));
  }, [claims, search]);

  const openCases = claims.filter((claim) => !['RESUELTO', 'NO_PROCEDE', 'CERRADO'].includes(claim.status)).length;
  const reviewingCases = claims.filter((claim) => ['EN_REVISION', 'INVESTIGANDO', 'ESPERANDO_INFORMACION'].includes(claim.status)).length;
  const paymentCases = claims.filter((claim) => claim.status === 'PAGO_POR_VERIFICAR').length;
  const resolvedCases = claims.filter((claim) => ['RESUELTO', 'NO_PROCEDE', 'CERRADO'].includes(claim.status)).length;

  const columns = [
    { header: 'Número de caso', accessor: 'case_code', cell: (row) => <span className="font-black text-brand-dark">{row.case_code}</span> },
    { header: 'Encomienda', accessor: 'shipment_id', cell: (row) => <span>#{row.shipment_id}</span> },
    { header: 'Solicitante', accessor: 'claimant_name' },
    { header: 'Tipo', accessor: 'kind', cell: () => 'Atención operativa' },
    { header: 'Motivo', accessor: 'category', cell: (row) => CATEGORIES.find(([key]) => key === row.category)?.[1] || row.category },
    { header: 'Canal', accessor: 'source', cell: (row) => ({ WEB: 'Web', PRESENCIAL: 'Presencial', TELEFONO: 'Teléfono' }[row.source] || row.source) },
    { header: 'Estado', accessor: 'status', cell: (row) => <StatusBadge value={row.status} /> },
    { header: '', accessor: 'actions', cell: (row) => <Link className="font-bold text-brand-green underline" to={`${caseBasePath || `/admin/agencias/${agencyId}/reclamos`}/${row.id}`}>Ver caso</Link> },
  ];

  useEffect(() => () => {
    if (shipmentLookupTimer.current) clearTimeout(shipmentLookupTimer.current);
    shipmentLookupSequence.current += 1;
  }, []);

  if (!agencyId) return <Navigate to="/admin/agencias" replace />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-widest text-brand-green">Atención de casos · {agencyName}</p><h2 className="page-title">Reclamos de la agencia</h2><p className="page-subtitle">Casos de esta agencia, su investigación y las soluciones registradas.</p></div>
        {canCreate && <Button onClick={() => { setShowForm((current) => !current); setError(''); }}><Plus size={17} className="mr-2" />{showForm ? 'Cerrar registro' : 'Registrar presencialmente'}</Button>}
      </header>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Casos abiertos', value: openCases, Icon: ClipboardList, tone: 'text-brand-green', accent: 'border-l-brand-green', iconSurface: 'bg-brand-green/10' },
          { label: 'En investigación', value: reviewingCases, Icon: Search, tone: 'text-amber-700', accent: 'border-l-amber-400', iconSurface: 'bg-amber-50' },
          { label: 'Pago por verificar', value: paymentCases, Icon: WalletCards, tone: 'text-orange-700', accent: 'border-l-orange-400', iconSurface: 'bg-orange-50' },
          { label: 'Resueltos o cerrados', value: resolvedCases, Icon: ShieldCheck, tone: 'text-green-800', accent: 'border-l-green-700', iconSurface: 'bg-green-50' },
        ].map(({ label, value, Icon, tone, accent, iconSurface }) => <Card key={label} className={`flex items-center justify-between gap-3 border-l-4 ${accent}`}><div><p className="text-sm font-semibold text-brand-gray">{label}</p><strong className={`mt-1 block text-3xl font-black ${tone}`}>{value}</strong></div><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconSurface}`}><Icon className={tone} size={21} aria-hidden="true" /></span></Card>)}
      </div>

      {showForm && <Card className="border-t-4 border-t-brand-green/70">
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-brand-green/10 bg-gradient-to-r from-brand-green/5 via-brand-lime/10 to-transparent p-3"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green/10 text-brand-green"><ClipboardList size={20} aria-hidden="true" /></span><div><h3 className="text-lg font-black text-brand-black">Ingreso presencial</h3><p className="mt-1 text-sm text-brand-gray">El caso quedará asignado a {agencyName}.</p></div></div><button type="button" className="rounded-lg px-3 py-1.5 text-sm font-bold text-brand-green transition hover:bg-brand-green/10" onClick={() => setShowForm(false)}>Cancelar</button></div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <Input
              label="Código de encomienda"
              name="shipment_code"
              value={form.shipment_code}
              onChange={handleShipmentCodeChange}
              onBlur={() => { void lookupShipmentSender(); }}
              required
            />
            {shipmentLookup.loading && <p role="status" className="mt-1 text-xs text-brand-gray">Buscando encomienda…</p>}
            {shipmentLookup.error && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{shipmentLookup.error}</p>}
            {shipmentLookup.message && <p role="status" className="mt-1 text-xs text-brand-green">{shipmentLookup.message}</p>}
          </div>
          <Input
            label="DNI del remitente o destinatario"
            name="claimant_document_number"
            value={form.claimant_document_number}
            onChange={(event) => setForm({ ...form, claimant_document_number: event.target.value })}
            inputMode="numeric"
            maxLength={8}
            required
          />
          <label className="grid gap-1.5 text-sm font-semibold text-brand-dark">Motivo<select className="min-h-11 rounded-xl border border-gray-200 bg-white px-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{CATEGORIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <Input label="Teléfono de contacto" value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} />
          <Input label="Correo de contacto" type="email" value={form.contact_email} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} />
          <label className="grid gap-1.5 text-sm font-semibold text-brand-dark md:col-span-2">Descripción<textarea className="rounded-xl border border-gray-200 p-3 font-normal outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-lime/20" rows={4} minLength={10} maxLength={4000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          {notice && <p className="rounded-xl border border-brand-green/10 border-l-4 border-l-brand-green/40 bg-gradient-to-r from-brand-lime/10 to-brand-surface p-3 text-sm text-brand-gray md:col-span-2">{notice.text}</p>}
          <label className="flex items-start gap-2 text-sm font-normal text-brand-gray md:col-span-2"><input type="checkbox" checked={privacyAcknowledged} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} required className="mt-1 accent-green-700" />Informé al cliente sobre el tratamiento de sus datos para atender y dar seguimiento a este caso.</label>
           <div className="md:col-span-2"><Button type="submit" disabled={saving || shipmentLookup.loading || !notice}>{saving ? 'Registrando…' : 'Registrar caso'}</Button></div>
        </form>
      </Card>}

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><h3 className="text-lg font-black text-brand-black">Bandeja de casos</h3><p className="mt-1 text-sm text-brand-gray">Solo se muestran casos asignados a {agencyName}.</p></div>
          <div className="grid gap-3 rounded-xl border border-brand-green/10 bg-gradient-to-r from-brand-surface to-brand-lime/10 p-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold text-brand-gray">Buscar<input className="min-h-10 rounded-xl border border-gray-200 px-3 text-sm font-normal text-brand-black" placeholder="Caso, encomienda o solicitante" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <label className="grid gap-1 text-xs font-bold text-brand-gray">Estado<select className="min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal text-brand-black" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          </div>
        </div>
        <div className="mt-5">{loading ? <Loader label="Cargando casos…" /> : <DataTable columns={columns} data={visibleClaims} emptyMessage="No hay casos que coincidan con estos filtros." caption={`Reclamos de ${agencyName}`} headerClassName="border-b border-brand-green/15 bg-gradient-to-r from-[#edf7e9] via-[#f8fbf6] to-[#edf7e9]" />}</div>
      </Card>
    </div>
  );
}

export default Reclamos;
