export const OPTIMIZATION_ALGORITHMS = {
  FIRST_FIT_3D: {
    id: 'FIRST_FIT_3D',
    label: 'First Fit 3D',
    endpoint: '/first-fit/run',
    payload: {},
  },
  BEST_FIT_3D: {
    id: 'BEST_FIT_3D',
    label: 'Best Fit 3D',
    endpoint: '/best-fit/run',
    payload: {},
  },
  WORST_FIT: {
    id: 'WORST_FIT',
    label: 'Worst Fit',
    endpoint: '/worst-fit/run',
    payload: {},
  },
  BEST_FIT_DECREASING_3D: {
    id: 'BEST_FIT_DECREASING_3D',
    label: 'Best Fit Decreasing 3D',
    endpoint: '/best-fit-decreasing/run',
    payload: {},
  },
  BACKTRACKING_LOGISTIC: {
    id: 'BACKTRACKING_LOGISTIC',
    label: 'Backtracking 3D',
    endpoint: '/backtracking/run',
    payload: {},
  },
  MINIMAX: {
    id: 'MINIMAX',
    label: 'Minimax',
    endpoint: '/minimax-maximin/run',
    payload: { strategy: 'MINIMAX' },
  },
  MAXIMIN: {
    id: 'MAXIMIN',
    label: 'Maximin',
    endpoint: '/minimax-maximin/run',
    payload: { strategy: 'MAXIMIN' },
  },
};

export const ACTIVE_OPTIMIZATION_ALGORITHM_ID =
  import.meta.env.VITE_OPTIMIZATION_POC_ALGORITHM || 'MINIMAX';

export function getOptimizationAlgorithm(algorithmId = ACTIVE_OPTIMIZATION_ALGORITHM_ID) {
  return OPTIMIZATION_ALGORITHMS[algorithmId] || OPTIMIZATION_ALGORITHMS.FIRST_FIT_3D;
}
