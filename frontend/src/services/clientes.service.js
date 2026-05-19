import apiClient from './apiClient.js';
import { clientesMock } from '../data/mockData.js';

export const clientesService = {
  async list() {
    // Reemplazar por apiClient.get('/clientes') cuando FastAPI exponga el endpoint.
    return Promise.resolve(clientesMock);
  },
  async create(payload) {
    return apiClient.post('/clientes', payload);
  },
};
