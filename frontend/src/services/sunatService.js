import apiClient, { apiBaseURL, getBackendBaseURL } from './apiClient.js';

function normalizePayload(payload) {
  return typeof payload === 'object'
    ? { confirmar_pago: true, ...payload, encomienda_id: Number(payload.encomienda_id) }
    : { encomienda_id: Number(payload), confirmar_pago: true };
}

function buildPdfPath(serie, numero) {
  return `/sunat/boletas/mock/${encodeURIComponent(serie)}/${encodeURIComponent(numero)}/pdf`;
}

export function buildMockPdfURLFromResponse(pdfUrl) {
  if (!pdfUrl) return '';
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  if (pdfUrl.startsWith('/api/v1')) return `${getBackendBaseURL()}${pdfUrl}`;
  if (pdfUrl.startsWith('/')) return `${apiBaseURL}${pdfUrl}`;
  return `${apiBaseURL}/${pdfUrl}`;
}

export async function emitirBoletaDesdeEncomienda(payload) {
  const response = await apiClient.post('/sunat/boletas/emitir-desde-encomienda', normalizePayload(payload));
  return response.data;
}

export async function obtenerPdfMockBoleta(serie, numero) {
  const response = await apiClient.get(buildPdfPath(serie, numero), { responseType: 'blob' });
  return response.data;
}

export async function descargarPdfMock(pdfUrl, serie, numero) {
  if (!pdfUrl) return obtenerPdfMockBoleta(serie, numero);
  const response = await apiClient.get(buildMockPdfURLFromResponse(pdfUrl), { responseType: 'blob' });
  return response.data;
}

export async function generarPdfBetaDesdeEncomienda(payload) {
  const response = await apiClient.post(
    '/sunat/boletas/beta/pdf-desde-encomienda',
    normalizePayload(payload),
    { responseType: 'blob' },
  );
  return response.data;
}

export async function generarXmlBetaDesdeEncomienda(payload) {
  const response = await apiClient.post('/sunat/boletas/beta/xml-desde-encomienda', normalizePayload(payload));
  return response.data;
}

export const sunatService = {
  emitirBoletaDesdeEncomienda,
  obtenerPdfMockBoleta,
  descargarPdfMock,
  generarPdfBetaDesdeEncomienda,
  generarXmlBetaDesdeEncomienda,
};
