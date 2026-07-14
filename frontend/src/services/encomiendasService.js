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

export async function eliminarPreRegistroVencido(id) {
  const response = await apiClient.delete(`/encomiendas/${id}/pre-registro-vencido`);
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

export async function confirmarPreRegistro(id, orientacionBase = null) {
  const body = orientacionBase ? { orientacion_base: orientacionBase } : undefined;
  const response = await apiClient.post(`/encomiendas/${id}/confirmar-registro`, body);
  return response.data;
}

export async function entregarEncomienda(id, payload) {
  const response = await apiClient.post(`/encomiendas/${id}/entregar`, payload);
  return response.data;
}

export async function getEtiquetaPdf(id) {
  const response = await apiClient.get(`/encomiendas/${id}/etiqueta/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function exportarReporteEncomiendas(formato, filtros = {}) {
  const extension = formato === 'excel' ? 'xlsx' : 'pdf';
  const response = await apiClient.get(`/encomiendas/reportes/operativo.${extension}`, {
    params: {
      fecha: filtros.fecha || undefined,
      estado: filtros.estado || undefined,
      texto: filtros.texto?.trim() || undefined,
    },
    responseType: 'blob',
  });
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
  eliminarPreRegistroVencido,
  getEncomiendas,
  getEncomiendaById,
  getEncomiendaByCodigo,
  confirmarPreRegistro,
  entregarEncomienda,
  getEtiquetaPdf,
  exportarReporteEncomiendas,
};
