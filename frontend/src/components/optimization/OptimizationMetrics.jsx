import React from 'react';

function MetricItem({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-brand-black">
        {value ?? 'N/A'}
      </p>
    </div>
  );
}

function OptimizationMetrics({ result }) {
  if (!result) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <MetricItem label="Algoritmo" value={result.algorithm} />
      <MetricItem label="Ocupación" value={`${result.occupation_percentage ?? 0}%`} />
      <MetricItem label="Peso usado" value={`${result.weight_percentage ?? 0}%`} />
      <MetricItem label="Éxito" value={`${result.success_rate ?? 0}%`} />
      <MetricItem label="Paquetes colocados" value={result.placed_count} />
      <MetricItem label="Paquetes no colocados" value={result.unplaced_count} />
      <MetricItem label="Tiempo" value={`${result.execution_time_ms ?? 0} ms`} />
      <MetricItem
        label="Cumplimiento de zona"
        value={
          result.zone_compliance_percentage !== undefined
            ? `${result.zone_compliance_percentage}%`
            : 'N/A'
        }
      />
      <MetricItem
        label="Estiba"
        value={
          result.stacking_compliance_percentage !== undefined
            ? `${result.stacking_compliance_percentage}%`
            : 'N/A'
        }
      />
      <MetricItem
        label="Estabilidad"
        value={
          result.stability_compliance_percentage !== undefined
            ? `${result.stability_compliance_percentage}%`
            : 'N/A'
        }
      />
    </div>
  );
}

export default OptimizationMetrics;