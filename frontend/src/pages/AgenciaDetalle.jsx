import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { hasRole } from '../auth/accessControl.js';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import AgencyStatusBadge from '../components/common/AgencyStatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { activateAgencia, getAgencia } from '../services/agenciasService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import AgencyUsers from './AgencyUsers.jsx';
import Clientes from './Clientes.jsx';
import Dashboard from './Dashboard.jsx';
import Encomiendas from './Encomiendas.jsx';
import Reclamos from './Reclamos.jsx';

const SECTIONS = new Set(['dashboard', 'encomiendas', 'clientes', 'usuarios', 'reclamos']);

function AgenciaDetalle() {
  const { agencyId, section = 'dashboard' } = useParams();
  const { user } = useAuth();
  const isGlobalAdmin = hasRole(user, ['ADMIN_GENERAL']);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getAgencia(agencyId)
      .then((result) => { if (mounted) setAgency(result); })
      .catch((loadError) => { if (mounted) setError(getApiErrorMessage(loadError, 'No se pudo abrir la agencia.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [agencyId]);

  if (!SECTIONS.has(section)) return <Navigate to={`/admin/agencias/${agencyId}`} replace />;
  if (loading) return <Loader label="Cargando agencia…" />;
  if (!agency) return <Alert tone="error">{error || 'Agencia no encontrada.'}</Alert>;

  async function handleActivate() {
    try {
      setSaving(true);
      setError('');
      setAgency(await activateAgencia(agencyId));
    } catch (activationError) {
      setError(getApiErrorMessage(activationError, 'Asigna un administrador de agencia antes de activarla.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-[#1f4d2f] via-brand-dark to-[#16331f] px-6 py-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
        <div>
          {isGlobalAdmin && <Link to="/admin/agencias" className="inline-flex min-h-10 items-center text-sm font-bold text-brand-lime hover:text-white focus-visible:underline">← Volver a administración general</Link>}
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-brand-lime">Panel administrativo · {agency.code}</p>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Agencia {agency.destination.name}</h2>
          <p className="mt-2 text-sm text-white/80">{agency.address || 'Dirección pendiente'} · {agency.phone || 'Teléfono pendiente'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <AgencyStatusBadge active={agency.is_active} onDark />
          {isGlobalAdmin && !agency.is_active && <Button onClick={handleActivate} disabled={saving || !agency.admin}>{saving ? 'Activando…' : 'Activar agencia'}</Button>}
        </div>
      </div>
      {!agency.is_active && <Alert tone="info">Esta agencia aún no opera. Asigna un administrador y actívala para comenzar.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {section === 'dashboard' && <Dashboard agencyId={agencyId} agencyName={`Agencia ${agency.destination.name}`} />}
      {section === 'usuarios' && <AgencyUsers agency={agency} isGlobalAdmin={isGlobalAdmin} onAgencyChange={setAgency} />}
      {section === 'encomiendas' && <Encomiendas agencyId={agencyId} />}
      {section === 'clientes' && <Clientes agencyId={agencyId} />}
      {section === 'reclamos' && <Reclamos agencyId={agencyId} agencyName={`Agencia ${agency.destination.name}`} />}
    </div>
  );
}

export default AgenciaDetalle;
