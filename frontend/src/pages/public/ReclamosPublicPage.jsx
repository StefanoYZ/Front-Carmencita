import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Phone } from 'lucide-react';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import { getApiErrorMessage } from '../../services/apiClient.js';
import {
  createPublicClaim,
  getClaimPrivacyNotice,
  getPublicClaimSender,
  getPublicClaimAgencies,
  lookupPublicClaim,
  uploadPublicClaimEvidence,
} from '../../services/reclamosService.js';

const CATEGORIES = [
  ['DANO', 'Daño del paquete'], ['PERDIDA', 'Paquete extraviado'], ['FALTANTE', 'Contenido faltante'],
  ['RETRASO', 'Retraso'], ['ENTREGA', 'Problema de entrega'], ['COBRO', 'Cobro o pago'],
  ['ATENCION', 'Atención recibida'], ['OTRO', 'Otro'],
];
const STATUS_LABELS = {
  RECIBIDO: 'Recibido', EN_REVISION: 'En revisión', ESPERANDO_INFORMACION: 'Esperando información',
  INVESTIGANDO: 'En investigación', PROPUESTA_ENVIADA: 'Solución propuesta',
  PAGO_POR_VERIFICAR: 'Verificando pago', RESUELTO: 'Resuelto', NO_PROCEDE: 'No procede', CERRADO: 'Cerrado',
};
const STATUS_STYLES = {
  RECIBIDO: 'border-sky-200 bg-sky-50 text-sky-800',
  EN_REVISION: 'border-amber-200 bg-amber-50 text-amber-800',
  ESPERANDO_INFORMACION: 'border-orange-200 bg-orange-50 text-orange-800',
  INVESTIGANDO: 'border-violet-200 bg-violet-50 text-violet-800',
  PROPUESTA_ENVIADA: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  PAGO_POR_VERIFICAR: 'border-orange-200 bg-orange-50 text-orange-800',
  RESUELTO: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  NO_PROCEDE: 'border-rose-200 bg-rose-50 text-rose-800',
  CERRADO: 'border-slate-200 bg-slate-100 text-slate-700',
};
const PUBLIC_EVENT_LABELS = {
  RECIBIDO: 'Reclamo recibido',
  INVESTIGACION: 'Revisión del caso',
  ACTUALIZACION_CLIENTE: 'Actualización del caso',
  RESOLUCION_REGISTRADA: 'Resolución registrada',
  PAGO_POR_VERIFICAR: 'Pago por verificar',
  PAGO_VERIFICADO: 'Pago verificado',
  PAGO_OBSERVADO: 'Pago observado',
};
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES);
const EMPTY_SENDER_LOOKUP = { loading: false, error: '', message: '' };

function statusStyle(status) {
  return STATUS_STYLES[status] || 'border-slate-200 bg-slate-100 text-slate-700';
}

function normalizeShipmentCode(value) {
  return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function ReclamosPublicPage() {
  const [searchParams] = useSearchParams();
  const initialShipmentCode = searchParams.get('codigo') || '';
  const [mode, setMode] = useState('crear');
  const [agencies, setAgencies] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [createdCase, setCreatedCase] = useState(null);
  const [lookupResult, setLookupResult] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [senderLookup, setSenderLookup] = useState(EMPTY_SENDER_LOOKUP);
  const senderLookupSequence = useRef(0);
  const senderLookupCode = useRef('');
  const senderLookupInFlight = useRef('');
  const activeShipmentCode = useRef(normalizeShipmentCode(initialShipmentCode));
  const documentManuallyEdited = useRef(false);
  const [form, setForm] = useState({
  shipment_code: initialShipmentCode, document_number: '', agency_id: '',
    category: 'DANO', description: '',
    contact_phone: '', contact_email: '', privacy_notice_accepted: false,
  });
  const [lookup, setLookup] = useState({ case_code: '', shipment_code: initialShipmentCode, document_number: '' });

  useEffect(() => {
    let mounted = true;
    Promise.all([getClaimPrivacyNotice(), getPublicClaimAgencies()])
      .then(([noticeResult, agencyResult]) => {
        if (!mounted) return;
        setNotice(noticeResult);
        setAgencies(agencyResult);
        if (agencyResult.length === 1) setForm((current) => current.agency_id ? current : ({ ...current, agency_id: String(agencyResult[0].id) }));
      })
      .catch((loadError) => { if (mounted) setError(getApiErrorMessage(loadError, 'No se pudieron cargar los datos del servicio.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const lookupSenderForShipment = useCallback(async (rawShipmentCode) => {
    const shipmentCode = normalizeShipmentCode(rawShipmentCode);
    if (shipmentCode.length < 8 || senderLookupCode.current === shipmentCode || senderLookupInFlight.current === shipmentCode) return;

    const requestSequence = ++senderLookupSequence.current;
    senderLookupInFlight.current = shipmentCode;
    setSenderLookup({ loading: true, error: '', message: '' });
    try {
      const sender = await getPublicClaimSender(shipmentCode);
      if (requestSequence !== senderLookupSequence.current || activeShipmentCode.current !== shipmentCode) return;
      senderLookupCode.current = shipmentCode;
      if (sender.sender_document_type?.toUpperCase() !== 'DNI' || !/^[0-9]{8}$/.test(sender.sender_document_number || '')) {
        setSenderLookup({ loading: false, error: 'El remitente no tiene un DNI registrado. Ingresa el DNI del remitente o destinatario.' , message: '' });
        return;
      }
      if (documentManuallyEdited.current) {
        setSenderLookup({ loading: false, error: '', message: 'Encomienda encontrada. Se conservó el documento que ingresaste.' });
        return;
      }
      setForm((current) => (
        normalizeShipmentCode(current.shipment_code) === shipmentCode
          ? { ...current, shipment_code: shipmentCode, document_number: sender.sender_document_number }
          : current
      ));
      setSenderLookup({ loading: false, error: '', message: 'DNI del remitente completado. Puedes cambiarlo si el reclamo corresponde al destinatario.' });
    } catch (lookupError) {
      if (requestSequence !== senderLookupSequence.current || activeShipmentCode.current !== shipmentCode) return;
      setForm((current) => (
        normalizeShipmentCode(current.shipment_code) === shipmentCode
          ? { ...current, document_number: '' }
          : current
      ));
      setSenderLookup({
        loading: false,
        error: getApiErrorMessage(lookupError, 'No se encontró la encomienda.'),
        message: '',
      });
    } finally {
      if (senderLookupInFlight.current === shipmentCode) senderLookupInFlight.current = '';
    }
  }, []);

  useEffect(() => {
    const shipmentCode = normalizeShipmentCode(form.shipment_code);
    if (shipmentCode.length < 8) return undefined;
    const timer = window.setTimeout(() => {
      void lookupSenderForShipment(shipmentCode);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form.shipment_code, lookupSenderForShipment]);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    if (name === 'shipment_code') {
      const normalizedCode = normalizeShipmentCode(value);
      activeShipmentCode.current = normalizedCode;
      senderLookupSequence.current += 1;
      senderLookupCode.current = '';
      senderLookupInFlight.current = '';
      documentManuallyEdited.current = false;
      setSenderLookup(EMPTY_SENDER_LOOKUP);
      setForm((current) => ({ ...current, shipment_code: value, document_number: '' }));
    } else {
      if (name === 'document_number') documentManuallyEdited.current = true;
      setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    }
    setError('');
    setMessage('');
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!/^[0-9]{8}$/.test(form.document_number)) {
      setError('Ingresa el DNI de 8 dígitos registrado como remitente o destinatario.');
      return;
    }
    try {
      setSaving(true);
      const created = await createPublicClaim({
        ...form,
        agency_id: Number(form.agency_id),
        privacy_notice_version: notice.version,
      });
      setCreatedCase(created);
      if (evidence) {
        try {
          await uploadPublicClaimEvidence(created.case_code, evidence, form.shipment_code, form.document_number);
        } catch (uploadError) {
          setMessage(`Reclamo ${created.case_code} creado, pero la imagen no se pudo adjuntar: ${getApiErrorMessage(uploadError, 'vuelve a intentar o comunícate con la agencia')}`);
          return;
        }
      }
      setMessage(`Recibimos tu reclamo. Guarda este número de caso: ${created.case_code}`);
      setLookup((current) => ({ ...current, case_code: created.case_code, shipment_code: form.shipment_code, document_number: form.document_number }));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'No se pudo registrar el reclamo. Verifica el código y el DNI.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLookup(event) {
    event.preventDefault();
    const identifiers = Object.fromEntries(
      Object.entries(lookup).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value),
    );
    if (!Object.keys(identifiers).length) {
      setError('Ingresa al menos un dato para buscar: número de caso, código de encomienda o DNI.');
      setLookupResult(null);
      return;
    }
    try {
      setSaving(true);
      setError('');
      setLookupResult(await lookupPublicClaim(identifiers));
    } catch (lookupError) {
      setLookupResult(null);
      setError(getApiErrorMessage(lookupError, 'No encontramos el caso o no pudimos validar los datos.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10"><Loader label="Cargando atención de reclamos…" /></div>;

  return (
    <main className="min-h-[70vh] bg-brand-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green"><ArrowLeft size={16} />Volver al inicio</Link>
        <header><p className="text-xs font-black uppercase tracking-widest text-brand-green">Atención al cliente</p><h1 className="mt-1 text-3xl font-black text-brand-black">Reclamos de encomiendas</h1><p className="mt-2 text-brand-gray">Consulta tu agencia, contáctala directamente o registra un caso para que podamos revisarlo.</p></header>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Opciones de reclamo">
          <button type="button" role="tab" aria-selected={mode === 'crear'} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === 'crear' ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark'}`} onClick={() => setMode('crear')}>Presentar reclamo</button>
          <button type="button" role="tab" aria-selected={mode === 'consultar'} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === 'consultar' ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark'}`} onClick={() => setMode('consultar')}>Consultar un caso</button>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        {message && <Alert tone="success">{message}</Alert>}

        {mode === 'crear' ? (
          <div className="space-y-5">
            <Card>
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-lime/25 text-brand-green"><Building2 size={20} /></span><div><h2 className="font-black text-brand-black">Elige dónde enviaste tu encomienda</h2><p className="text-sm text-brand-gray">Puedes llamar directamente o dejar el reclamo en línea.</p></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {agencies.map((agency) => <label key={agency.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${Number(form.agency_id) === agency.id ? 'border-brand-green bg-brand-lime/10 ring-2 ring-brand-green/20' : 'border-gray-200 bg-white hover:border-brand-lime'}`}>
                  <input type="radio" name="agency_id" value={agency.id} checked={Number(form.agency_id) === agency.id} onChange={updateForm} className="mt-1 accent-green-700" />
                  <span className="min-w-0 flex-1"><strong className="block text-brand-black">{agency.place}</strong><span className="mt-1 block text-sm text-brand-gray">{agency.address || 'Dirección no registrada'}</span>{agency.phone ? <a href={`tel:${agency.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-green" onClick={(click) => click.stopPropagation()}><Phone size={14} />Llamar {agency.phone}</a> : <span className="mt-2 block text-xs text-brand-gray">Esta agencia no tiene teléfono publicado; puedes dejar tu reclamo aquí.</span>}</span>
                </label>)}
                {!agencies.length && <p className="text-sm text-brand-gray">No hay agencias activas publicadas actualmente.</p>}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-black text-brand-black">Registrar un caso</h2>
              <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
                <div>
                  <Input label="Código de encomienda" name="shipment_code" value={form.shipment_code} onChange={updateForm} required />
                  {senderLookup.loading && <p role="status" className="mt-1 text-xs text-brand-gray">Buscando remitente…</p>}
                  {senderLookup.error && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{senderLookup.error}</p>}
                  {senderLookup.message && <p role="status" className="mt-1 text-xs text-brand-green">{senderLookup.message}</p>}
                </div>
                <Input label="DNI del remitente o destinatario" name="document_number" value={form.document_number} onChange={updateForm} inputMode="numeric" maxLength={8} required />
                <label className="grid gap-1.5 text-sm font-semibold text-brand-dark">Motivo<select name="category" value={form.category} onChange={updateForm} className="min-h-11 rounded-xl border border-gray-200 bg-white px-3">{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <Input label="Teléfono de contacto" name="contact_phone" value={form.contact_phone} onChange={updateForm} />
                <Input label="Correo de contacto" name="contact_email" type="email" value={form.contact_email} onChange={updateForm} />
                <label className="grid gap-1.5 text-sm font-semibold text-brand-dark md:col-span-2">Describe lo ocurrido<textarea name="description" value={form.description} onChange={updateForm} minLength={10} maxLength={4000} rows={4} required className="rounded-xl border border-gray-200 bg-white p-3 font-normal" /></label>
                <label className="grid gap-1.5 text-sm font-semibold text-brand-dark md:col-span-2">Foto del paquete o del problema (opcional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setEvidence(event.target.files?.[0] || null)} className="rounded-xl border border-gray-200 bg-white p-3 text-sm" /><span className="text-xs font-normal text-brand-gray">JPG, PNG o WebP; máximo 5 MB.</span></label>
                {notice && <label className="flex items-start gap-2 text-sm font-normal text-brand-gray md:col-span-2"><input type="checkbox" checked={form.privacy_notice_accepted} onChange={updateForm} name="privacy_notice_accepted" className="mt-1 accent-green-700" required />He leído el aviso de privacidad para el tratamiento de los datos de este caso.</label>}
                <div className="md:col-span-2"><Button type="submit" disabled={saving || senderLookup.loading || !agencies.length || !notice}>{saving ? 'Enviando…' : 'Enviar reclamo'}</Button></div>
              </form>
            </Card>
            {createdCase && <Card><h2 className="font-black text-brand-black">Tu número de caso</h2><p className="mt-2 text-2xl font-black text-brand-green">{createdCase.case_code}</p><p className="mt-1 text-sm text-brand-gray">Guarda el número de caso para encontrarlo fácilmente. También puedes buscar tus casos por encomienda o DNI.</p></Card>}
          </div>
        ) : (
          <Card>
            <h2 className="text-lg font-black text-brand-black">Consulta el estado de tu caso</h2>
            <p className="mt-2 text-sm text-brand-gray">Completa cualquiera de estos datos. Si ingresas más de uno, deben coincidir con el mismo caso.</p>
            <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleLookup}>
              <Input label="Número de caso" value={lookup.case_code} onChange={(event) => setLookup({ ...lookup, case_code: event.target.value })} />
              <Input label="Código de encomienda" value={lookup.shipment_code} onChange={(event) => setLookup({ ...lookup, shipment_code: event.target.value })} />
              <Input label="DNI" value={lookup.document_number} onChange={(event) => setLookup({ ...lookup, document_number: event.target.value })} inputMode="numeric" maxLength={20} />
              <div className="md:col-span-3"><Button type="submit" disabled={saving}>{saving ? 'Consultando…' : 'Consultar caso'}</Button></div>
            </form>
            {lookupResult && <div className="mt-6 space-y-4" aria-live="polite">
              <h3 className="font-bold text-brand-dark">{lookupResult.length === 1 ? 'Caso encontrado' : `Casos encontrados (${lookupResult.length})`}</h3>
              {lookupResult.map((result) => <article key={result.case_code} className="overflow-hidden rounded-2xl border border-brand-lime/50 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-lime/30 bg-gradient-to-r from-brand-lime/20 via-white to-emerald-50 px-5 py-4">
                  <div><p className="text-xs font-black uppercase tracking-wider text-brand-green">{CATEGORY_LABELS[result.category] || result.category}</p><h4 className="mt-1 text-lg font-black text-brand-dark">Caso {result.case_code}</h4></div>
                  <span className={`rounded-full border px-3 py-1.5 text-sm font-bold ${statusStyle(result.status)}`}>{STATUS_LABELS[result.status] || result.status}</span>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-xs font-semibold text-brand-gray">Registrado el <time className="text-brand-dark">{new Date(result.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
                  <section className="rounded-xl border border-sky-100 bg-sky-50/70 p-4"><h5 className="text-xs font-black uppercase tracking-wide text-sky-800">Descripción del reclamo</h5><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-dark">{result.description}</p></section>
                  {result.requested_solution && <section className="rounded-xl border border-amber-100 bg-amber-50/70 p-4"><h5 className="text-xs font-black uppercase tracking-wide text-amber-800">Solución solicitada</h5><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-dark">{result.requested_solution}</p></section>}
                  {result.resolution_text && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h5 className="text-xs font-black uppercase tracking-wide text-emerald-800">Resolución</h5><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-950">{result.resolution_text}</p></section>}
                  {result.events?.length > 0 && <section><h5 className="mb-3 text-sm font-black text-brand-dark">Actualizaciones para ti</h5><ol className="space-y-3">{result.events.map((event) => <li key={event.id} className="rounded-xl border border-gray-100 border-l-4 border-l-brand-green bg-brand-surface/70 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle(event.to_status || result.status)}`}>{event.to_status ? STATUS_LABELS[event.to_status] || event.to_status : PUBLIC_EVENT_LABELS[event.event_type] || 'Actualización'}</span><time className="text-xs text-brand-gray">{new Date(event.created_at).toLocaleString('es-PE')}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-brand-dark">{event.note}</p></li>)}</ol></section>}
                </div>
              </article>)}
            </div>}
          </Card>
        )}
      </div>
    </main>
  );
}

export default ReclamosPublicPage;
