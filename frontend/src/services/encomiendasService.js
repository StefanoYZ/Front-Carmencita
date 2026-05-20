import apiClient from './apiClient.js';

export async function createEncomienda(payload) {
  const response = await apiClient.post('/encomiendas', payload);
  return response.data;
}

export async function crearPreRegistro(payload) {
  const response = await apiClient.post('/encomiendas/pre-registro', payload);
  return response.data;
}

export async function updateEncomienda(id, payload) {
  const response = await apiClient.put(`/encomiendas/${id}`, payload);
  return response.data;
}

export async function deleteEncomienda(id) {
  const response = await apiClient.delete(`/encomiendas/${id}`);
  return response.data;
}

export async function getEncomiendas() {
  const response = await apiClient.get('/encomiendas');
  return response.data;
}

export async function getEncomiendaById(id) {
  const response = await apiClient.get(`/encomiendas/${id}`);
  return response.data;
}

export async function getEncomiendaByCodigo(codigo) {
  const response = await apiClient.get(`/encomiendas/codigo/${encodeURIComponent(codigo)}`);
  return response.data;
}

export const crearEncomienda = createEncomienda;
export const buscarPorCodigo = getEncomiendaByCodigo;

export const encomiendasService = {
  crearPreRegistro,
  crearEncomienda,
  buscarPorCodigo,
  createEncomienda,
  updateEncomienda,
  deleteEncomienda,
  getEncomiendas,
  getEncomiendaById,
  getEncomiendaByCodigo,
};
