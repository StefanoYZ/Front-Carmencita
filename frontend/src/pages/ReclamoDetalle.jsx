import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { hasRole } from '../auth/accessControl.js';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  createClaimEvent,
  downloadClaimAttachment,
  getClaim,
  saveClaimResolution,
  uploadClaimAttachment,
  verifyClaimPayment,
} from '../services/reclamosService.js';

const STATUS_LABELS = {
  RECIBIDO: 'Recibido', EN_REVISION: 'En revisión', ESPERANDO_INFORMACION: 'Esperando información',
  INVESTIGANDO: 'Investigando', PROPUESTA_ENVIADA: 'Solución propuesta',
  PAGO_POR_VERIFICAR: 'Pago por verificar', RESUELTO: 'Resuelto', NO_PROCEDE: 'No procede', CERRADO: 'Cerrado',
};
const NEXT_STATUSES = {
  RECIBIDO: ['EN_REVISION', 'CERRADO'],
  EN_REVISION: ['ESPERANDO_INFORMACION', 'INVESTIGANDO', 'NO_PROCEDE', 'CERRADO'],
  ESPERANDO_INFORMACION: ['EN_REVISION', 'INVESTIGANDO', 'CERRADO'],
  INVESTIGANDO: ['ESPERANDO_INFORMACION', 'NO_PROCEDE', 'CERRADO'],
  PROPUESTA_ENVIADA: ['EN_REVISION', 'CERRADO'],
  RESUELTO: ['CERRADO', 'INVESTIGANDO'],
  NO_PROCEDE: ['CERRADO', 'EN_REVISION'],
};
function ReclamoDetalle({ agencyIdOverride }) {
  const { claimId, agencyId: routeAgencyId } = useParams();
  const agencyId = routeAgencyId || agencyIdOverride;
  const { user } = useAuth();
  const isGlobalAdmin = hasRole(user, ['ADMIN_GENERAL']);
  const canResolve = isGlobalAdmin || hasRole(user, ['AGENCY_ADMIN']);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [customerVisible, setCustomerVisible] = useState(false);
  const [resolution, setResolution] = useState({ resolution_type: 'NO_MONETARIA', resolution_text: '', amount: '', payment_method: '', payment_reference: '' });
  const [proof, setProof] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setDetail(await getClaim(claimId, agencyId));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar el reclamo.'));
    } finally {
      setLoading(false);
    }
  }, [claimId, agencyId]);

  useEffect(() => { void loadDetail(); }, [loadDetail]);

  async function addNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    try {
      setBusy(true);
      await createClaimEvent(claimId, agencyId, { event_type: nextStatus ? 'INVESTIGACION' : 'NOTA', note: note.trim(), visible_to_customer: customerVisible, to_status: nextStatus || null });
      setNote('');
      setNextStatus('');
      setCustomerVisible(false);
      setMessage('Actividad añadida al historial.');
      await loadDetail();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'No se pudo guardar la actualización.'));
    } finally {
      setBusy(false);
    }
  }

  async function submitResolution(event) {
    event.preventDefault();
    if (!canResolve) return;
    try {
      setBusy(true);
      setError('');
      let proofAttachmentId;
      if (resolution.resolution_type === 'MONETARIA') {
        if (!proof) throw new Error('Adjunta la imagen del comprobante antes de registrar el pago.');
        const attachment = await uploadClaimAttachment(claimId, agencyId, proof, 'COMPROBANTE_PAGO', true);
        proofAttachmentId = attachment.id;
      }
      await saveClaimResolution(claimId, agencyId, {
        resolution_type: resolution.resolution_type,
        resolution_text: resolution.resolution_text.trim(),
        ...(resolution.resolution_type === 'MONETARIA' ? {
          amount: Number(resolution.amount), currency: 'PEN', payment_method: resolution.payment_method,
          payment_reference: resolution.payment_reference || null, payment_proof_attachment_id: proofAttachmentId,
        } : {}),
      });
      setProof(null);
      setMessage(resolution.resolution_type === 'MONETARIA' ? 'Solución registrada. El administrador debe verificar el comprobante para cerrar el caso.' : 'Solución no monetaria registrada y reclamo resuelto.');
      await loadDetail();
    } catch (resolutionError) {
      setError(getApiErrorMessage(resolutionError, 'No se pudo registrar la solución.'));
    } finally {
      setBusy(false);
    }
  }

  async function handlePaymentVerification(verified) {
    if (!verified && !verificationNote.trim()) {
      setError('Indica por qué se observa el comprobante.');
      return;
    }
    try {
      setBusy(true);
      await verifyClaimPayment(claimId, agencyId, { verified, note: verificationNote.trim() });
      setVerificationNote('');
      setMessage(verified ? 'Comprobante verificado. Caso resuelto.' : 'Comprobante observado; caso devuelto a investigación.');
      await loadDetail();
    } catch (verifyError) {
      setError(getApiErrorMessage(verifyError, 'No se pudo verificar el pago.'));
    } finally {
      setBusy(false);
    }
  }

  async function openAttachment(attachment) {
    try {
      const blob = await downloadClaimAttachment(claimId, agencyId, attachment.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, 'No se pudo abrir la evidencia.'));
    }
  }

  if (!agencyId) return <Navigate to="/login" replace />;
  if (loading) return <Loader label="Cargando reclamo…" />;
  if (!detail) return <Alert tone="error">{error || 'Reclamo no encontrado.'}</Alert>;
  const { claim, events, attachments } = detail;
  const backPath = hasRole(user, ['SECRETARIA'])
    ? '/secretaria/reclamos'
    : `/admin/agencias/${agencyId}/reclamos`;
  const nextOptions = (NEXT_STATUSES[claim.status] || []).filter((status) => (
    canResolve || !['NO_PROCEDE', 'CERRADO', 'RESUELTO', 'PAGO_POR_VERIFICAR', 'PROPUESTA_ENVIADA'].includes(status)
  ));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-brand-green">Caso {claim.case_code}</p><h2 className="page-title">Detalle del reclamo</h2><p className="page-subtitle">Encomienda {detail.shipment.shipment_code} · Atención operativa</p></div><Link to={backPath} className="font-bold text-brand-green underline">Volver a reclamos</Link></div>
      {error && <Alert tone="error">{error}</Alert>}{message && <Alert tone="success">{message}</Alert>}
      <div className="grid gap-5">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-black">Solicitud</h3><StatusBadge value={claim.status} /></div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-brand-gray">Encomienda</dt><dd className="font-bold">{detail.shipment.shipment_code} · {detail.shipment.origin} → {detail.shipment.destination}</dd></div><div><dt className="text-brand-gray">Persona</dt><dd className="font-bold">{claim.claimant_name} · {claim.claimant_role === 'REMITENTE' ? 'Remitente' : 'Destinatario'}</dd></div><div><dt className="text-brand-gray">Motivo</dt><dd className="font-bold">{claim.category}</dd></div><div><dt className="text-brand-gray">Canal</dt><dd className="font-bold">{claim.source}</dd></div><div><dt className="text-brand-gray">Contacto</dt><dd className="font-bold">{claim.contact_phone || claim.contact_email || 'No registrado'}</dd></div></dl>
          <div className="mt-4 rounded-xl bg-brand-surface p-4"><p className="whitespace-pre-wrap text-sm leading-6">{claim.description}</p>{claim.requested_solution && <p className="mt-3 text-sm"><strong>Solicita:</strong> {claim.requested_solution}</p>}</div>
          {(claim.resolution_recorded_by_name || claim.resolved_by_name || claim.payment_verified_by_name) && <div className="mt-3 grid gap-1 text-xs text-brand-gray"><p>Solución ingresada por: <strong className="text-brand-dark">{claim.resolution_recorded_by_name || '—'}</strong></p><p>Resolución confirmada por: <strong className="text-brand-dark">{claim.resolved_by_name || '—'}</strong></p>{claim.payment_verified_by_name && <p>Pago verificado por: <strong className="text-brand-dark">{claim.payment_verified_by_name}</strong></p>}</div>}
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-black">Historial de atención</h3>
         <ol className="mt-4 space-y-4">{events.map((event) => <li key={event.id} className="flex gap-3 border-l-2 border-gray-200 pl-4"><div className="min-w-0 flex-1"><p className="font-bold">{event.to_status ? STATUS_LABELS[event.to_status] || event.to_status : event.event_type}</p><p className="whitespace-pre-wrap text-sm text-brand-gray">{event.note}</p><p className="text-xs text-brand-gray">Responsable: {event.actor_name || 'Sistema'} · {new Date(event.created_at).toLocaleString('es-PE')}</p></div><span className="text-xs font-bold text-brand-gray">{event.visible_to_customer ? 'Cliente' : 'Interno'}</span></li>)}</ol>
        <form className="mt-5 grid gap-3 border-t pt-4" onSubmit={addNote}><h4 className="font-bold">Añadir actualización</h4><textarea className="rounded-xl border p-3" rows={3} value={note} onChange={(event) => setNote(event.target.value)} required placeholder="Registra una gestión o comunicación" /><div className="flex flex-wrap items-center gap-3"><select className="min-h-10 rounded-xl border px-3" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}><option value="">Sin cambiar estado</option>{nextOptions.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={customerVisible} onChange={(event) => setCustomerVisible(event.target.checked)} />Visible para cliente</label><Button type="submit" disabled={busy}>Guardar actualización</Button></div></form>
      </Card>
      <Card>
        <h3 className="text-lg font-black">Evidencias</h3>
        {attachments.length ? <ul className="mt-3 space-y-2">{attachments.map((attachment) => <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg bg-brand-surface p-3 text-sm"><span>{attachment.file_name} · {attachment.attachment_kind} · {Math.ceil(attachment.file_size / 1024)} KB</span><button type="button" className="font-bold text-brand-green underline" onClick={() => void openAttachment(attachment)}>Abrir</button></li>)}</ul> : <p className="mt-2 text-sm text-brand-gray">Aún no se adjuntaron imágenes.</p>}
      </Card>
      {claim.resolution_text && <Card>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-black">Solución registrada</h3><StatusBadge value={claim.status} /></div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{claim.resolution_text}</p>
        {claim.resolution_type === 'MONETARIA' && <p className="mt-3 rounded-lg bg-brand-surface p-3 text-sm">Monto: <strong>S/ {claim.resolution_amount?.toFixed(2)}</strong> · Medio: <strong>{claim.payment_method || '—'}</strong>{claim.payment_reference && <> · Referencia: <strong>{claim.payment_reference}</strong></>}</p>}
      </Card>}
      {canResolve && !['RESUELTO', 'NO_PROCEDE', 'CERRADO', 'PAGO_POR_VERIFICAR'].includes(claim.status) && <Card>
        <h3 className="text-lg font-black">Registrar solución</h3>
        <p className="mt-1 text-sm text-brand-gray">Describe claramente la medida acordada. Una solución monetaria quedará pendiente de verificación antes de cerrar el caso.</p>
        <form className="mt-4 grid gap-4" onSubmit={submitResolution}>
          <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-bold">Tipo de solución</legend>
            {[['NO_MONETARIA', 'Solución no monetaria', 'Reposición, reparación u otra medida.'], ['MONETARIA', 'Devolución o compensación', 'Requiere comprobante y verificación.']].map(([value, label, description]) => <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${resolution.resolution_type === value ? 'border-brand-green bg-brand-lime/10 ring-2 ring-brand-green/20' : 'border-gray-200'}`}><input type="radio" name="resolution_type" value={value} checked={resolution.resolution_type === value} onChange={(event) => setResolution({ ...resolution, resolution_type: event.target.value })} className="mt-1 accent-green-700" /><span><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs font-normal text-brand-gray">{description}</span></span></label>)}
          </fieldset>
          <label className="grid gap-1.5 text-sm font-semibold">Descripción de la solución<textarea className="rounded-xl border border-gray-200 p-3 font-normal" rows={3} minLength={10} maxLength={4000} value={resolution.resolution_text} onChange={(event) => setResolution({ ...resolution, resolution_text: event.target.value })} required placeholder="Indica qué se acordó con el cliente y cómo se atenderá el caso." /></label>
          {resolution.resolution_type === 'MONETARIA' && <div className="grid gap-4 rounded-xl bg-brand-surface p-4 md:grid-cols-2">
            <Input label="Monto a devolver o compensar (S/)" type="number" min="0.01" step="0.01" value={resolution.amount} onChange={(event) => setResolution({ ...resolution, amount: event.target.value })} required />
            <label className="grid gap-1.5 text-sm font-semibold">Medio de pago<select className="min-h-11 rounded-xl border border-gray-200 bg-white px-3" value={resolution.payment_method} onChange={(event) => setResolution({ ...resolution, payment_method: event.target.value })} required><option value="">Selecciona un medio</option>{['TRANSFERENCIA', 'YAPE', 'PLIN', 'EFECTIVO', 'OTRO'].map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
            <Input label="Referencia de pago (opcional)" value={resolution.payment_reference} onChange={(event) => setResolution({ ...resolution, payment_reference: event.target.value })} />
            <label className="grid gap-1.5 text-sm font-semibold">Comprobante de pago<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProof(event.target.files?.[0] || null)} required className="rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-normal" /><span className="text-xs font-normal text-brand-gray">Imagen JPG, PNG o WebP; máximo 5 MB.</span></label>
          </div>}
          <div><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Registrar solución'}</Button></div>
        </form>
      </Card>}
      {canResolve && claim.status === 'PAGO_POR_VERIFICAR' && <Card><h3 className="text-lg font-black">Verificación del pago</h3><p className="mt-2 text-sm text-brand-gray">La solución es de S/ {claim.resolution_amount?.toFixed(2)} por {claim.payment_method}. Revisa la evidencia adjunta y deja constancia de tu revisión.</p><label className="mt-4 grid gap-1.5 text-sm font-semibold">Nota de verificación<textarea className="rounded-xl border border-gray-200 p-3 font-normal" rows={3} value={verificationNote} onChange={(event) => setVerificationNote(event.target.value)} placeholder="Observaciones de la revisión" /></label><div className="mt-4 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void handlePaymentVerification(true)}>Verificar pago y resolver</Button><Button variant="secondary" disabled={busy || !verificationNote.trim()} onClick={() => void handlePaymentVerification(false)}>Observar comprobante</Button></div></Card>}
    </div>
  );
}

export default ReclamoDetalle;
