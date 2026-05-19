import apiClient from './apiClient.js';
import { encomiendasMock } from '../data/mockData.js';

export const encomiendasService = {
  async list() {
    // Reemplazar por apiClient.get('/encomiendas') cuando FastAPI este listo.
    return Promise.resolve(encomiendasMock);
  },
  async create(payload) {
    return apiClient.post('/encomiendas', payload);
  },
};
