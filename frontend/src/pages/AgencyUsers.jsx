import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import PasswordInput from '../components/common/PasswordInput.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { roleLabel } from '../utils/roleLabels.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { assignAgencyAdmin, createAgencyUser, getAgencyUsers, setAgencyUserActive } from '../services/agenciasService.js';

const emptyForm = { username: '', full_name: '', password: '', confirmPassword: '', role: 'SECRETARIA' };

export function availableAgencyRoles(isGlobalAdmin) {
  return isGlobalAdmin ? ['AGENCY_ADMIN', 'SECRETARIA', 'ESTIBA'] : ['SECRETARIA', 'ESTIBA'];
}

function AgencyUsers({ agency, isGlobalAdmin, onAgencyChange }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const roles = availableAgencyRoles(isGlobalAdmin);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setUsers(await getAgencyUsers(agency.id));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar el equipo de esta agencia.'));
    } finally {
      setLoading(false);
    }
  }, [agency.id]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!roles.includes(form.role)) return;
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.role === 'AGENCY_ADMIN' && agency.admin && !window.confirm(`¿Reemplazar al administrador ${agency.admin.full_name}? Se desactivará su cuenta.`)) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = { username: form.username.trim(), full_name: form.full_name.trim(), password: form.password };
      if (form.role === 'AGENCY_ADMIN') {
        const updatedAgency = await assignAgencyAdmin(agency.id, payload);
        onAgencyChange(updatedAgency);
        setMessage('Administrador de agencia creado y asignado.');
      } else {
        await createAgencyUser(agency.id, { ...payload, role: form.role });
        setMessage('Usuario creado dentro de esta agencia.');
      }
      setForm(emptyForm);
      await loadUsers();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'No se pudo crear el usuario.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(user) {
    if (!window.confirm(`¿${user.is_active ? 'Desactivar' : 'Activar'} a ${user.full_name}?`)) return;
    try {
      setUpdatingId(user.id);
      setError('');
      const updated = await setAgencyUserActive(agency.id, user.id, !user.is_active);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage('Estado de la cuenta actualizado.');
    } catch (statusError) {
      setError(getApiErrorMessage(statusError, 'No se pudo cambiar el estado de la cuenta.'));
    } finally {
      setUpdatingId(null);
    }
  }

  const columns = [
    { header: 'Usuario', accessor: 'username' },
    { header: 'Nombre', accessor: 'full_name' },
    { header: 'Rol', accessor: 'roles', cell: (row) => row.roles.map(roleLabel).join(', ') },
    { header: 'Estado', accessor: 'is_active', cell: (row) => <StatusBadge value={row.is_active ? 'ACTIVO' : 'INACTIVO'} /> },
    { header: 'Acciones', accessor: 'id', cell: (row) => row.roles.some((role) => ['SECRETARIA', 'ESTIBA'].includes(role))
      ? <button type="button" disabled={updatingId === row.id} className="font-bold text-brand-green underline disabled:opacity-50" onClick={() => handleStatus(row)}>{row.is_active ? 'Desactivar' : 'Activar'}</button>
      : '—' },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="page-title">Usuarios internos</h2><p className="page-subtitle">Equipo de {agency.destination.name}. Cada usuario queda vinculado a esta agencia.</p></div>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      <Card>
        <h3 className="text-lg font-black text-brand-black">Crear usuario</h3>
        <p className="mt-1 text-sm text-brand-gray">Agencia asignada: {agency.destination.name}</p>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Nombre completo" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
          <Input label="Usuario" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
          <PasswordInput label="Contraseña" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <PasswordInput label="Confirmar contraseña" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
          <label className="grid gap-2 text-sm font-bold text-brand-dark md:col-span-2">Función en la agencia
            <select className="min-h-11 rounded-xl border border-gray-200 bg-white px-3" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </label>
          {form.role === 'AGENCY_ADMIN' && agency.admin && <p className="text-sm text-amber-800 md:col-span-2">Administrador actual: {agency.admin.full_name}. Se desactivará al reemplazarlo.</p>}
          <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Crear usuario'}</Button></div>
        </form>
      </Card>
      <Card>
        <h3 className="mb-4 text-lg font-black text-brand-black">Equipo de la agencia</h3>
        {loading ? <Loader label="Cargando equipo…" /> : <DataTable columns={columns} data={users} emptyMessage="Aún no hay usuarios en esta agencia." />}
      </Card>
    </div>
  );
}

export default AgencyUsers;
