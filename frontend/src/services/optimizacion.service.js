import apiClient from './apiClient.js';

export const optimizacionService = {
  async obtenerEscenario() {
    const response = await apiClient.get('/load-optimization/sample');

    const sample = response.data.data;

    if (!sample) {
      throw new Error('No existe un escenario guardado');
    }

    return sample;
  },

  async optimizarCarga(algorithm) {
    const sample = await optimizacionService.obtenerEscenario();

    const payload = {
      ...sample,
      algorithm,
    };

    const response = await apiClient.post('/load-optimization/simulate', payload);

    return {
      sample,
      result: response.data,
    };
  },

  async compararAlgoritmos() {
    const sample = await optimizacionService.obtenerEscenario();

    const payload = {
      ...sample,
      algorithm: 'bfd3d',
    };

    const response = await apiClient.post('/load-optimization/compare', payload);

    return {
      sample,
      comparison: response.data,
    };
  },
};
