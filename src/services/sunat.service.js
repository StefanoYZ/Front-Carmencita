import { formatDate } from '../utils/formatDate.js';

export const sunatService = {
  async emitirBoleta(payload) {
    return Promise.resolve({
      ...payload,
      serie: 'B001',
      numero: '000128',
      estado: 'Aceptado',
      fecha: formatDate(),
    });
  },
};
