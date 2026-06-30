// Catálogo de los 3 mejores modelos de optimización, clasificados por relación
// cantidad/aprovechamiento (paquetes colocados + % de volumen del camión usado),
// según la comparativa con 70 paquetes (scripts/comparar_modelos.py):
//
//   1º MINIMAX                — 42 paquetes · 48.19% volumen  (coloca la mayor cantidad)
//   2º WORST_FIT              — 41 paquetes · 51.13% volumen  (mejor % de volumen, 1 menos)
//   3º BEST_FIT_DECREASING_3D — variante decreciente de Best Fit
//
// El #1 (MINIMAX) queda como modelo activo por defecto.
export const OPTIMIZATION_ALGORITHMS = {
  MINIMAX: {
    id: 'MINIMAX',
    label: 'Minimax',
    rank: 1,
    endpoint: '/minimax-maximin/run',
    payload: { strategy: 'MINIMAX' },
  },
  WORST_FIT: {
    id: 'WORST_FIT',
    label: 'Worst Fit',
    rank: 2,
    endpoint: '/worst-fit/run',
    payload: {},
  },
  BEST_FIT_DECREASING_3D: {
    id: 'BEST_FIT_DECREASING_3D',
    label: 'Best Fit Decreasing 3D',
    rank: 3,
    endpoint: '/best-fit-decreasing/run',
    payload: {},
  },
};

export const ACTIVE_OPTIMIZATION_ALGORITHM_ID = 'MINIMAX';

// Modelos disponibles, ordenados por clasificación (1 → 3).
export const AVAILABLE_OPTIMIZATION_ALGORITHM_IDS = ['MINIMAX', 'WORST_FIT', 'BEST_FIT_DECREASING_3D'];

export function getOptimizationAlgorithm(algorithmId = ACTIVE_OPTIMIZATION_ALGORITHM_ID) {
  return OPTIMIZATION_ALGORITHMS[algorithmId] || OPTIMIZATION_ALGORITHMS[ACTIVE_OPTIMIZATION_ALGORITHM_ID];
}
