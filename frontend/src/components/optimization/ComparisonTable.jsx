import React from 'react';

function formatValue(value, suffix = '') {
  if (value === null || value === undefined) return 'N/A';
  return `${value}${suffix}`;
}

function ComparisonTable({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Algoritmo</th>
            <th className="border px-3 py-2">Ocupación</th>
            <th className="border px-3 py-2">Peso</th>
            <th className="border px-3 py-2">Éxito</th>
            <th className="border px-3 py-2">Tiempo</th>
            <th className="border px-3 py-2">Colocados</th>
            <th className="border px-3 py-2">No colocados</th>
            <th className="border px-3 py-2">Zona</th>
            <th className="border px-3 py-2">Estiba</th>
            <th className="border px-3 py-2">Estabilidad</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.algorithm} className="bg-white">
              <td className="border px-3 py-2 font-medium">
                {item.algorithm}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.occupation_percentage, '%')}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.weight_percentage, '%')}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.success_rate, '%')}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.execution_time_ms, ' ms')}
              </td>
              <td className="border px-3 py-2">{item.placed_count}</td>
              <td className="border px-3 py-2">{item.unplaced_count}</td>
              <td className="border px-3 py-2">
                {formatValue(item.zone_compliance_percentage, '%')}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.stacking_compliance_percentage, '%')}
              </td>
              <td className="border px-3 py-2">
                {formatValue(item.stability_compliance_percentage, '%')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComparisonTable;