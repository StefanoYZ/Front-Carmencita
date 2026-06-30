import apiClient from './apiClient.js';

export async function iniciarLogBoleta(payload) {
  const response = await apiClient.post('/logs/boletas/iniciar', payload);
  return response.data;
}

export async function finalizarLogBoleta(logId, payload = {}) {
  const response = await apiClient.post(`/logs/boletas/${logId}/finalizar`, payload);
  return response.data;
}

export async function iniciarRegistroServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/registro/iniciar', payload);
  return response.data;
}

export async function finalizarRegistroServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/registro/finalizar', payload);
  return response.data;
}

export async function iniciarCargaServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/carga/iniciar', payload);
  return response.data;
}

export async function finalizarCargaServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/carga/finalizar', payload);
  return response.data;
}

export async function iniciarEntregaServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/entrega/iniciar', payload);
  return response.data;
}

export async function finalizarEntregaServicio(payload) {
  const response = await apiClient.post('/logs/servicio-transporte/entrega/finalizar', payload);
  return response.data;
}

export const measurementLogsService = {
  iniciarLogBoleta,
  finalizarLogBoleta,
  iniciarRegistroServicio,
  finalizarRegistroServicio,
  iniciarCargaServicio,
  finalizarCargaServicio,
  iniciarEntregaServicio,
  finalizarEntregaServicio,
};
