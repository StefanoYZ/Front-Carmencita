import { formatCurrency } from '../utils/formatCurrency.js';

export const cotizacionService = {
  async calcular({ peso = 0, largo = 0, ancho = 0, alto = 0 }) {
    const volumen = (Number(largo) * Number(ancho) * Number(alto)) / 6000;
    const pesoFacturable = Math.max(Number(peso), volumen);
    const monto = 12 + pesoFacturable * 4.8;

    return Promise.resolve({
      pesoFacturable: pesoFacturable.toFixed(2),
      monto,
      montoFormateado: formatCurrency(monto),
    });
  },
};
