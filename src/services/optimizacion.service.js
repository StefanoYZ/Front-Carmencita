import { paquetesMock } from '../data/mockData.js';

export const optimizacionService = {
  async listarPaquetes() {
    return Promise.resolve(paquetesMock);
  },
  async optimizarCarga() {
    return Promise.resolve({
      aprovechamiento: 91,
      recomendacion: 'Ordenar paquetes de mayor volumen en la base y priorizar fragiles en zona superior.',
    });
  },
};
