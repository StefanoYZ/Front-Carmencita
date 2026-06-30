import React from 'react';

/**
 * Tabla de datos reutilizable.
 * Cada columna admite:
 *  - header, accessor, cell(row)
 *  - wrap: permite que el contenido use varias lineas (por defecto una sola)
 *  - className / headerClassName: clases extra para la celda / encabezado
 *  - align: 'left' | 'right' | 'center'
 */
function alignClass(align) {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

function DataTable({ columns, data, emptyMessage = 'No hay registros disponibles.', caption }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_2px_rgba(33,37,41,0.04),0_14px_34px_-18px_rgba(33,37,41,0.22)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-b from-brand-surface to-white">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className={`px-4 py-3 text-xs font-black uppercase tracking-wider text-brand-gray ${alignClass(column.align)} ${column.headerClassName || ''}`}
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
                <tr key={row.id || rowIndex} className="group transition-colors hover:bg-brand-lime/10">
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.accessor}
                      className={`px-4 py-3 text-brand-black ${alignClass(column.align)} ${
                        column.wrap ? 'align-top' : 'whitespace-nowrap'
                      } ${
                        colIndex === 0 ? 'border-l-2 border-transparent group-hover:border-brand-green' : ''
                      } ${column.className || ''}`}
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm font-semibold text-brand-gray">{emptyMessage}</p>
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
