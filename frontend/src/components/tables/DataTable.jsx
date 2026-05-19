import React from 'react';
function DataTable({ columns, data, emptyMessage = 'No hay registros disponibles.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-4 py-3 text-left font-semibold text-gray-600"
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
                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.accessor} className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
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
