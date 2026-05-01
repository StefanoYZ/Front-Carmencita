import { ciudadanoMock } from '../data/mockData.js';

export const reniecService = {
  async consultarDni(dni) {
    return Promise.resolve({
      ...ciudadanoMock,
      dni: dni || ciudadanoMock.dni,
    });
  },
};
