import apiClient from './apiClient.js';

export async function iniciarOrdenCarga(payload) {
  const response = await apiClient.post('/logs/carga/iniciar-orden', payload);
  return response.data;
}

export async function finalizarPaqueteCarga(ordenCargaId, encomiendaId, payload = {}) {
  const response = await apiClient.post(
    `/logs/carga/${ordenCargaId}/paquete/${encomiendaId}/finalizar`,
    payload,
  );
  return response.data;
}

export async function siguienteSimulado(ordenCargaId, encomiendaId) {
  const response = await apiClient.post(
    `/logs/carga/${ordenCargaId}/siguiente-simulado`,
    null,
    { params: { encomienda_id: encomiendaId } },
  );
  return response.data;
}

export async function getOrdenCargaStatus(ordenCargaId) {
  const response = await apiClient.get(`/logs/carga/${ordenCargaId}`);
  return response.data;
}

export const cargaLogsService = {
  iniciarOrdenCarga,
  finalizarPaqueteCarga,
  siguienteSimulado,
  getOrdenCargaStatus,
};
