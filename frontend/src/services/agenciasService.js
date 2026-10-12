import apiClient from './apiClient.js';

export async function getAgencias() {
  const response = await apiClient.get('/agencias');
  return response.data;
}

export async function getAgencia(agencyId) {
  const response = await apiClient.get(`/agencias/${agencyId}`);
  return response.data;
}

export async function createAgencia(payload) {
  const response = await apiClient.post('/agencias', payload);
  return response.data;
}

export async function activateAgencia(agencyId) {
  const response = await apiClient.post(`/agencias/${agencyId}/activate`);
  return response.data;
}

export async function getAgencyDashboard(agencyId) {
  const response = await apiClient.get(`/agencias/${agencyId}/dashboard`);
  return response.data;
}

export async function getAgencyShipments(agencyId) {
  const response = await apiClient.get(`/agencias/${agencyId}/encomiendas`);
  return response.data;
}

export async function getAgencyShipment(agencyId, shipmentId) {
  const response = await apiClient.get(`/agencias/${agencyId}/encomiendas/${shipmentId}`);
  return response.data;
}

export async function findAgencyShipment(agencyId, code) {
  const response = await apiClient.get(`/agencias/${agencyId}/encomiendas/codigo/${encodeURIComponent(code)}`);
  return response.data;
}

export async function getAgencyClients(agencyId) {
  const response = await apiClient.get(`/agencias/${agencyId}/clientes`);
  return response.data;
}

export async function getAgencyReport(agencyId, format, filters) {
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  const response = await apiClient.get(`/agencias/${agencyId}/reportes/operativo.${extension}`, {
    params: { fecha: filters.fecha || undefined, estado: filters.estado || undefined, texto: filters.texto?.trim() || undefined },
    responseType: 'blob',
  });
  return response.data;
}

export async function getAgencyUsers(agencyId) {
  const response = await apiClient.get(`/agencias/${agencyId}/users`);
  return response.data;
}

export async function createAgencyUser(agencyId, payload) {
  const response = await apiClient.post(`/agencias/${agencyId}/users`, payload);
  return response.data;
}

export async function setAgencyUserActive(agencyId, userId, isActive) {
  const response = await apiClient.patch(`/agencias/${agencyId}/users/${userId}/status`, { is_active: isActive });
  return response.data;
}

export async function assignAgencyAdmin(agencyId, payload) {
  const response = await apiClient.put(`/agencias/${agencyId}/agency-admin`, payload);
  return response.data;
}
