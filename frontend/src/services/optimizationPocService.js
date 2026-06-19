import apiClient from './apiClient.js';
import { getOptimizationAlgorithm } from '../config/optimizationPocAlgorithms.js';

const basePath = '/optimization/poc';

export const optimizationPocService = {
  async getScenario(limit = 70) {
    const response = await apiClient.get(`${basePath}/scenario`, { params: { limit }, timeout: 30000 });
    return response.data;
  },

  async runAlgorithm(payload, algorithmId) {
    const algorithm = getOptimizationAlgorithm(algorithmId);
    const response = await apiClient.post(`${basePath}${algorithm.endpoint}`, {
      ...payload,
      ...algorithm.payload,
    }, {
      timeout: 90000,
    });
    return response.data;
  },

  async runFirstFit(payload) {
    return this.runAlgorithm(payload, 'FIRST_FIT_3D');
  },

  async runBestFit(payload) {
    return this.runAlgorithm(payload, 'BEST_FIT_3D');
  },

  async runWorstFit(payload) {
    return this.runAlgorithm(payload, 'WORST_FIT');
  },

  async runBestFitDecreasing(payload) {
    return this.runAlgorithm(payload, 'BEST_FIT_DECREASING_3D');
  },

  async runBacktracking(payload) {
    return this.runAlgorithm(payload, 'BACKTRACKING_LOGISTIC');
  },

  async runMinimaxMaximin(payload) {
    return this.runAlgorithm(payload, payload?.strategy === 'MAXIMIN' ? 'MAXIMIN' : 'MINIMAX');
  },
};
