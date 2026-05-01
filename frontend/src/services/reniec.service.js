const API_URL = 'http://localhost:8000/reniec';

export const reniecService = {
  async consultarDni(dni) {
    try {
      const response = await fetch(`${API_URL}/${dni}`);
      return await response.json();
    } catch (error) {
      return { error: 'Error al conectar con el backend' };
    }
  },
};