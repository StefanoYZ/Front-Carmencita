import apiClient from './apiClient.js';

export async function getClienteByDni(dni) {
  const response = await apiClient.get(`/clientes/${encodeURIComponent(dni)}`);
  return response.data;
}

export const clientesService = {
  async list() {
    const response = await apiClient.get('/clientes');
    return response.data;
  },
  getByDni: getClienteByDni,
  async create(payload) {
    return apiClient.post('/clientes', payload);
  },
};
