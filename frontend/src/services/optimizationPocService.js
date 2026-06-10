import apiClient from './apiClient.js';

const basePath = '/optimization/poc';

export const optimizationPocService = {
  async getScenario(limit = 50) {
    const response = await apiClient.get(`${basePath}/scenario`, { params: { limit } });
    return response.data;
  },

  async runFirstFit(payload) {
    const response = await apiClient.post(`${basePath}/first-fit/run`, payload);
    return response.data;
  },
};
