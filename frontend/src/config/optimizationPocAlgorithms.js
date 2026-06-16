export const OPTIMIZATION_ALGORITHMS = {
  FIRST_FIT_3D: {
    id: 'FIRST_FIT_3D',
    label: 'First Fit 3D',
    endpoint: '/first-fit/run',
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
  import.meta.env.VITE_OPTIMIZATION_POC_ALGORITHM || 'FIRST_FIT_3D';

export function getOptimizationAlgorithm(algorithmId = ACTIVE_OPTIMIZATION_ALGORITHM_ID) {
  return OPTIMIZATION_ALGORITHMS[algorithmId] || OPTIMIZATION_ALGORITHMS.FIRST_FIT_3D;
}
