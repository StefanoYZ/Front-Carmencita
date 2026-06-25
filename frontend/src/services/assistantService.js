import apiClient from './apiClient.js';

export async function sendChatMessage(payload) {
  const response = await apiClient.post('/asistente/chat', payload);
  return response.data;
}

export async function createRecojoExterno(payload) {
  const response = await apiClient.post('/asistente/recojo-externo', payload);
  return response.data;
}

export async function getRecojoExternoList(estado) {
  const params = estado ? { estado } : {};
  const response = await apiClient.get('/asistente/recojo-externo', { params });
  return response.data;
}

export async function updateRecojoExternoEstado(id, estado) {
  const response = await apiClient.patch(`/asistente/recojo-externo/${id}/estado`, { estado });
  return response.data;
}

export async function createLogAsistente(payload) {
  const response = await apiClient.post('/logs/asistente', payload);
  return response.data;
}

export async function getLogsAsistente(filters = {}) {
  const response = await apiClient.get('/logs/asistente', { params: filters });
  return response.data;
}

export async function getReporteAsistente(filters = {}) {
  const response = await apiClient.get('/logs/asistente/reporte', { params: filters });
  return response.data;
}

export async function getResumenAsistente() {
  const response = await apiClient.get('/logs/asistente/reporte/resumen');
  return response.data;
}

export async function getTiposContenido(activo = true) {
  const response = await apiClient.get('/asistente/tipos-contenido', { params: { activo } });
  return response.data;
}

export const assistantService = {
  sendChatMessage,
  createRecojoExterno,
  getRecojoExternoList,
  updateRecojoExternoEstado,
  createLogAsistente,
  getLogsAsistente,
  getReporteAsistente,
  getResumenAsistente,
  getTiposContenido,
};
