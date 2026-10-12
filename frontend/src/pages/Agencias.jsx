import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Plus } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import AgencyStatusBadge from '../components/common/AgencyStatusBadge.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { createAgencia, getAgencias } from '../services/agenciasService.js';
import { getDestinos } from '../services/destinosService.js';

const emptyForm = { destination_id: '', address: '', phone: '' };

export function getAvailablePlaces(destinations, agencies) {
  const occupied = new Set(agencies.map((agency) => Number(agency.destination_id)));
  return destinations
    .filter((destination) => destination.activo ?? destination.is_active)
    .filter((destination) => !occupied.has(Number(destination.id)))
    .map((destination) => ({ id: destination.id, name: destination.nombre ?? destination.name }));
}

function Agencias() {
  const [agencies, setAgencies] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [agenciesResult, destinationsResult] = await Promise.all([getAgencias(), getDestinos()]);
      setAgencies(agenciesResult);
      setDestinations(getAvailablePlaces(destinationsResult, agenciesResult));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudieron cargar las agencias.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.destination_id) {
      setError('Selecciona un destino o parada activa.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const created = await createAgencia({
        destination_id: Number(form.destination_id),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
      });
      setAgencies((current) => [...current, created]);
      setDestinations((current) => current.filter((place) => Number(place.id) !== created.destination_id));
      setForm(emptyForm);
      setMessage(`Agencia ${created.code} creada. Ábrela para asignar su administrador y equipo.`);
    } catch (createError) {
      setError(getApiErrorMessage(createError, 'No se pudo crear la agencia.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="page-title">Agencias</h2>
          <p className="page-subtitle">Los lugares son paradas de la ruta; solo los que registres aquí tendrán oficina.</p>
        </div>
        <p className="text-sm font-bold text-brand-gray">{agencies.length} registradas</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-lime/30 text-brand-dark"><Plus size={18} /></span>
          <div>
            <h3 className="font-black text-brand-black">Nueva agencia</h3>
            <p className="text-sm text-brand-gray">Elige un lugar activo de la ruta para abrir una oficina física.</p>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end" onSubmit={handleCreate}>
          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Lugar de la agencia</span>
            <select name="destination_id" value={form.destination_id} onChange={updateField} required disabled={loading || !destinations.length} className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50">
              <option value="">{loading ? 'Cargando lugares…' : destinations.length ? 'Selecciona un lugar' : 'No hay lugares disponibles'}</option>
              {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
            </select>
          </label>
          <Input label="Dirección" name="address" value={form.address} onChange={updateField} maxLength={255} />
          <Input label="Teléfono" name="phone" value={form.phone} onChange={updateField} maxLength={30} />
          <div className="md:col-span-2 xl:col-span-4">{!loading && !destinations.length && <p className="mb-3 text-sm text-brand-gray">No quedan lugares activos sin agencia. Revisa el catálogo de lugares.</p>}<Button type="submit" disabled={saving || loading || !destinations.length}>{saving ? 'Creando...' : 'Crear agencia'}</Button></div>
        </form>
      </Card>

      {loading ? <Loader label="Cargando agencias..." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agencies.map((agency) => (
            <Link key={agency.id} to={`/admin/agencias/${agency.id}`} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_28px_-20px_rgba(33,37,41,0.45)] transition hover:-translate-y-1 hover:border-brand-green hover:shadow-[0_16px_32px_-18px_rgba(33,37,41,0.4)]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-lime/25 text-brand-dark"><Building2 size={21} /></span>
                <AgencyStatusBadge active={agency.is_active} />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-brand-green">{agency.code}</p>
              <h3 className="mt-1 text-xl font-black text-brand-black">{agency.destination?.name}</h3>
              <div className="mt-4 space-y-2 text-sm text-brand-gray">
                <p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-green" />{agency.address || 'Sin dirección registrada'}</p>
                <p className="flex gap-2"><Phone size={16} className="shrink-0 text-brand-green" />{agency.phone || 'Sin teléfono registrado'}</p>
              </div>
              <p className="mt-5 border-t border-gray-100 pt-4 text-sm font-semibold text-brand-dark">{agency.admin ? `Admin.: ${agency.admin.full_name}` : 'Sin administrador asignado'}</p>
            </Link>
          ))}
          {!agencies.length && <Card className="md:col-span-2 xl:col-span-3"><p className="text-center text-lg font-bold text-brand-black">Aún no hay agencias registradas</p><p className="mt-2 text-center text-sm text-brand-gray">Elige un lugar arriba para crear la primera oficina; después podrás administrar su equipo.</p></Card>}
        </div>
      )}
    </div>
  );
}

export default Agencias;
