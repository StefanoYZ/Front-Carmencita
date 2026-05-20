import apiClient from './apiClient.js';

export async function consultarDni(dni) {
  const response = await apiClient.get(`/reniec/${encodeURIComponent(dni)}`);
  return response.data;
}

export const reniecService = {
  consultarDni,
};
