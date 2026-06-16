import React, { useEffect, useMemo, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  assignRoleToUser,
  createUsuario,
  disableUsuario,
  getRoles,
  getUsuarios,
  removeRoleFromUser,
} from '../services/usuariosService.js';

const emptyUserForm = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  role_id: '',
};

function UsuariosInternos() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [usersResult, rolesResult] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(usersResult);
      setRoles(rolesResult.filter((role) => role.is_active));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar usuarios internos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const rolesByName = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.name] = role;
      return acc;
    }, {});
  }, [roles]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.full_name.trim()) {
      setError('Completa usuario, correo, contraseña y nombre.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const created = await createUsuario({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
      });
      if (form.role_id) {
        await assignRoleToUser(created.id, Number(form.role_id));
      }
      setForm(emptyUserForm);
      setMessage('Usuario interno creado correctamente.');
      await loadData();
    } catch (createError) {
      setError(getApiErrorMessage(createError, 'No se pudo crear el usuario.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDisableUser = async (user) => {
    try {
      setError('');
      setMessage('');
      await disableUsuario(user.id);
      setMessage(`Usuario ${user.username} desactivado.`);
      await loadData();
    } catch (disableError) {
      setError(getApiErrorMessage(disableError, 'No se pudo desactivar el usuario.'));
    }
  };

  const handleRoleChange = async (user, nextRoleId) => {
    const currentRole = user.roles?.[0] ? rolesByName[user.roles[0]] : null;
    try {
      setError('');
      setMessage('');
      if (currentRole) {
        await removeRoleFromUser(user.id, currentRole.id);
      }
      if (nextRoleId) {
        await assignRoleToUser(user.id, Number(nextRoleId));
      }
      await loadData();
    } catch (roleError) {
      setError(getApiErrorMessage(roleError, 'No se pudo actualizar el rol del usuario.'));
    }
  };

  const columns = [
    { header: 'Usuario', accessor: 'username' },
    { header: 'Nombre', accessor: 'full_name' },
    { header: 'Correo', accessor: 'email' },
    { header: 'Estado', accessor: 'is_active', cell: (row) => (row.is_active ? 'Activo' : 'Inactivo') },
    {
      header: 'Rol',
      accessor: 'roles',
      cell: (row) => (
        <select
          className="min-h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
          value={rolesByName[row.roles?.[0]]?.id || ''}
          onChange={(event) => handleRoleChange(row, event.target.value)}
          disabled={!row.is_active}
        >
          <option value="">Sin rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Accion',
      accessor: 'accion',
      cell: (row) => (
        <button
          type="button"
          className="font-semibold text-brand-dark transition hover:text-brand-green disabled:text-brand-gray"
          disabled={!row.is_active}
          onClick={() => handleDisableUser(row)}
        >
          Desactivar
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Usuarios internos</h2>
        <p className="page-subtitle">Control de usuarios, estado y rol operativo.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card>
        <form className="grid gap-4 lg:grid-cols-5 lg:items-end" onSubmit={handleCreateUser}>
          <Input label="Usuario" name="username" value={form.username} onChange={updateField} required />
          <Input label="Nombre completo" name="full_name" value={form.full_name} onChange={updateField} required />
          <Input label="Correo" name="email" type="email" value={form.email} onChange={updateField} required />
          <Input label="Contraseña" name="password" type="password" value={form.password} onChange={updateField} required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Rol inicial</span>
            <select
              name="role_id"
              value={form.role_id}
              onChange={updateField}
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
            >
              <option value="">Sin rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <div className="lg:col-span-5">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </Card>

      {loading && <Loader label="Cargando usuarios..." />}

      <Card>
        <DataTable columns={columns} data={usuarios} />
      </Card>
    </div>
  );
}

export default UsuariosInternos;
