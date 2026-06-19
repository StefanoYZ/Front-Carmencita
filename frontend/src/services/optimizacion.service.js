import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const optimizacionService = {
  async obtenerEscenario() {
    const response = await axios.get(
      `${API_URL}/api/v1/load-optimization/sample`
    );

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

    const response = await axios.post(
      `${API_URL}/api/v1/load-optimization/simulate`,
      payload
    );

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

    const response = await axios.post(
      `${API_URL}/api/v1/load-optimization/compare`,
      payload
    );

    return {
      sample,
      comparison: response.data,
    };
  },
};