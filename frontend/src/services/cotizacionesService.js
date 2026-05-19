import apiClient from './apiClient.js';

export async function calcularCotizacion(payload) {
  const body = typeof payload === 'object' ? payload : { encomienda_id: Number(payload) };
  const response = await apiClient.post('/cotizaciones/calcular', body);
  return response.data;
}

export const cotizacionesService = {
  calcularCotizacion,
};
