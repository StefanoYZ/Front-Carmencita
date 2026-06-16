import apiClient from './apiClient.js';

export async function getDestinos({ incluirInactivos = false } = {}) {
  const response = await apiClient.get('/destinos', {
    params: incluirInactivos ? { incluir_inactivos: true } : undefined,
  });
  return response.data;
}

export async function createDestino(payload) {
  const response = await apiClient.post('/destinos', payload);
  return response.data;
}

export async function updateDestino(id, payload) {
  const response = await apiClient.put(`/destinos/${id}`, payload);
  return response.data;
}

export const destinosService = {
  getDestinos,
  createDestino,
  updateDestino,
};
