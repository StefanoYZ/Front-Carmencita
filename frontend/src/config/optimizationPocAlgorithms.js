export const OPTIMIZATION_ALGORITHMS = {
  BEST_FIT_DECREASING_3D: {
    id: 'BEST_FIT_DECREASING_3D',
    label: 'Best Fit Decreasing 3D',
    endpoint: '/best-fit-decreasing/run',
    payload: {},
  },
};

export const ACTIVE_OPTIMIZATION_ALGORITHM_ID =
  'BEST_FIT_DECREASING_3D';

export function getOptimizationAlgorithm(algorithmId = ACTIVE_OPTIMIZATION_ALGORITHM_ID) {
  return OPTIMIZATION_ALGORITHMS[algorithmId] || OPTIMIZATION_ALGORITHMS.BEST_FIT_DECREASING_3D;
}
