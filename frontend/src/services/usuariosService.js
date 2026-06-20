import apiClient from './apiClient.js';

export async function getUsuarios() {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function createUsuario(payload) {
  const response = await apiClient.post('/users', payload);
  return response.data;
}

export async function updateUsuario(id, payload) {
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
}

export async function setUsuarioActivo(id, isActive) {
  const response = await apiClient.patch(`/users/${id}/status`, { is_active: isActive });
  return response.data;
}

export async function getRoles() {
  const response = await apiClient.get('/roles');
  return response.data;
}

export async function assignRoleToUser(userId, roleId) {
  const response = await apiClient.post(`/users/${userId}/roles/${roleId}`);
  return response.data;
}

export async function removeRoleFromUser(userId, roleId) {
  const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
  return response.data;
}

export const usuariosService = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  setUsuarioActivo,
  getRoles,
  assignRoleToUser,
  removeRoleFromUser,
};
