import React from 'react';
function DataTable({ columns, data, emptyMessage = 'No hay registros disponibles.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-brand-surface">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-brand-gray"
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="transition hover:bg-brand-surface">
                  {columns.map((column) => (
                    <td key={column.accessor} className="whitespace-nowrap px-4 py-3 text-brand-black">
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-brand-gray">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
