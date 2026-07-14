// Catálogo de los modelos de optimización 3D. Todos están habilitados para poder
// probarlos desde la interfaz. El `rank` refleja la comparativa agregada de
// scripts/experimento_modelos.py (posición promedio a través de 6 escenarios;
// 1 = mejor). MINIMAX queda como modelo activo por defecto.
export const OPTIMIZATION_ALGORITHMS = {
  WORST_FIT: {
    id: 'WORST_FIT',
    label: 'Worst Fit',
    rank: 1,
    endpoint: '/worst-fit/run',
    payload: {},
  },
  BEST_FIT_DECREASING_3D: {
    id: 'BEST_FIT_DECREASING_3D',
    label: 'Best Fit Decreasing 3D',
    rank: 2,
    endpoint: '/best-fit-decreasing/run',
    payload: {},
  },
  MINIMAX: {
    id: 'MINIMAX',
    label: 'Minimax',
    rank: 3,
    endpoint: '/minimax-maximin/run',
    payload: { strategy: 'MINIMAX' },
  },
  FIRST_FIT_3D: {
    id: 'FIRST_FIT_3D',
    label: 'First Fit 3D',
    rank: 4,
    endpoint: '/first-fit/run',
    payload: {},
  },
  BEST_FIT_3D: {
    id: 'BEST_FIT_3D',
    label: 'Best Fit 3D',
    rank: 5,
    endpoint: '/best-fit/run',
    payload: {},
  },
  MAXIMIN: {
    id: 'MAXIMIN',
    label: 'Maximin',
    rank: 6,
    endpoint: '/minimax-maximin/run',
    payload: { strategy: 'MAXIMIN' },
  },
  BACKTRACKING_LOGISTIC: {
    id: 'BACKTRACKING_LOGISTIC',
    label: 'Backtracking (orden logístico)',
    rank: 7,
    endpoint: '/backtracking/run',
    payload: {},
  },
};

export const ACTIVE_OPTIMIZATION_ALGORITHM_ID = 'MINIMAX';

// Modelos disponibles, ordenados por clasificación agregada (1 → 7).
export const AVAILABLE_OPTIMIZATION_ALGORITHM_IDS = [
  'WORST_FIT',
  'BEST_FIT_DECREASING_3D',
  'MINIMAX',
  'FIRST_FIT_3D',
  'BEST_FIT_3D',
  'MAXIMIN',
  'BACKTRACKING_LOGISTIC',
];

export function getOptimizationAlgorithm(algorithmId = ACTIVE_OPTIMIZATION_ALGORITHM_ID) {
  return OPTIMIZATION_ALGORITHMS[algorithmId] || OPTIMIZATION_ALGORITHMS[ACTIVE_OPTIMIZATION_ALGORITHM_ID];
}
