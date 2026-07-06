import React, { useEffect, useMemo, useState } from 'react';
import { Database, FileDown, FileSpreadsheet, RefreshCw, Search, Table2 } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import Pagination from '../components/tables/Pagination.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { exportTable, getTableData, getTables } from '../services/developerService.js';
import { downloadBlob } from '../utils/downloadBlob.js';

const PAGE_SIZE = 25;

function formatCellValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function CellValue({ value }) {
  const text = formatCellValue(value);
  const isEmpty = text === '—';
  const truncated = text.length > 60 ? `${text.slice(0, 60)}…` : text;
  return (
    <span
      title={text.length > 60 ? text : undefined}
      className={isEmpty ? 'text-brand-gray/60' : 'font-medium text-brand-black'}
    >
      {truncated}
    </span>
  );
}

function DeveloperView() {
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [tableData, setTableData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState('');

  async function loadTables() {
    try {
      setTablesLoading(true);
      setError('');
      const result = await getTables();
      setTables(result);
      if (!selected && result.length > 0) {
        setSelected(result[0].name);
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar el catalogo de tablas.'));
    } finally {
      setTablesLoading(false);
    }
  }

  async function loadTableData(name, targetPage) {
    if (!name) return;
    try {
      setDataLoading(true);
      setError('');
      const result = await getTableData(name, { page: targetPage, pageSize: PAGE_SIZE });
      setTableData(result);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, `No se pudo cargar la tabla ${name}.`));
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selected) {
      loadTableData(selected, page);
    }
  }, [selected, page]);

  const filteredTables = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tables;
    return tables.filter((table) => table.name.toLowerCase().includes(term));
  }, [tables, search]);

  const totalRows = useMemo(
    () => tables.reduce((sum, table) => sum + table.row_count, 0),
    [tables],
  );

  const handleSelect = (name) => {
    setSelected(name);
    setPage(1);
    setMessage('');
  };

  const handleExport = async (format) => {
    if (!selected) return;
    try {
      setExporting(format);
      setError('');
      const blob = await exportTable(selected, format);
      const dateSuffix = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `${selected}_${dateSuffix}.${format === 'excel' ? 'xls' : 'csv'}`);
      setMessage(`Tabla ${selected} exportada a ${format === 'excel' ? 'Excel' : 'CSV'}.`);
    } catch (exportError) {
      setError(getApiErrorMessage(exportError, 'No se pudo exportar la tabla.'));
    } finally {
      setExporting('');
    }
  };

  const columns = useMemo(() => {
    if (!tableData?.columns) return [];
    return tableData.columns.map((column) => ({
      header: column,
      accessor: column,
      cell: (row) => <CellValue value={row[column]} />,
    }));
  }, [tableData]);

  const pageCount = tableData ? Math.max(1, Math.ceil(tableData.total / PAGE_SIZE)) : 1;
  const firstShown = tableData?.total ? (tableData.page - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = tableData ? Math.min(tableData.page * PAGE_SIZE, tableData.total) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="page-title">Vista Developer</h2>
          <p className="page-subtitle">
            Inspeccion de solo lectura de las tablas del sistema, con exportacion a CSV y Excel.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-brand-gray">
          <Database size={16} aria-hidden="true" />
          {tables.length} tablas · {totalRows.toLocaleString('es-PE')} filas totales
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
        {/* Catalogo de tablas */}
        <Card className="lg:sticky lg:top-24">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-gray">Tablas</h3>
            <button
              type="button"
              onClick={loadTables}
              disabled={tablesLoading}
              aria-label="Actualizar catalogo de tablas"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand-gray transition hover:border-brand-green hover:text-brand-green disabled:opacity-50"
            >
              <RefreshCw size={14} className={tablesLoading ? 'animate-spin' : ''} aria-hidden="true" />
            </button>
          </div>

          <label className="relative mb-3 block">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray/70"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar tabla..."
              aria-label="Buscar tabla"
              className="min-h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
            />
          </label>

          {tablesLoading ? (
            <Loader label="Cargando tablas..." />
          ) : (
            <nav className="max-h-[52vh] space-y-1 overflow-y-auto pr-1" aria-label="Catalogo de tablas">
              {filteredTables.map((table) => {
                const isActive = table.name === selected;
                return (
                  <button
                    key={table.name}
                    type="button"
                    onClick={() => handleSelect(table.name)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-b from-brand-green to-[#1f8f3a] text-white shadow-[0_8px_18px_-8px_rgba(40,167,69,0.6)]'
                        : 'text-brand-black hover:bg-brand-lime/15'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Table2 size={14} className="shrink-0" aria-hidden="true" />
                      <span className="truncate">{table.name}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-surface text-brand-gray'
                      }`}
                    >
                      {table.row_count.toLocaleString('es-PE')}
                    </span>
                  </button>
                );
              })}
              {filteredTables.length === 0 && (
                <p className="px-3 py-6 text-center text-sm font-semibold text-brand-gray">
                  Ninguna tabla coincide con la busqueda.
                </p>
              )}
            </nav>
          )}
        </Card>

        {/* Datos de la tabla seleccionada */}
        <div className="min-w-0 space-y-4">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-brand-black">
                  {selected || 'Selecciona una tabla'}
                </h3>
                {tableData && (
                  <p className="mt-1 text-sm text-brand-gray">
                    Mostrando {firstShown}–{lastShown} de {tableData.total.toLocaleString('es-PE')} filas ·{' '}
                    {tableData.columns.length} columnas
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => handleExport('csv')}
                  disabled={!selected || Boolean(exporting)}
                >
                  <FileDown size={16} aria-hidden="true" />
                  {exporting === 'csv' ? 'Exportando...' : 'CSV'}
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => handleExport('excel')}
                  disabled={!selected || Boolean(exporting)}
                >
                  <FileSpreadsheet size={16} aria-hidden="true" />
                  {exporting === 'excel' ? 'Exportando...' : 'Excel'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => loadTableData(selected, page)}
                  disabled={!selected || dataLoading}
                >
                  {dataLoading ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </Card>

          {dataLoading && !tableData && <Loader label="Cargando datos..." />}

          {tableData && (
            <>
              <DataTable
                columns={columns}
                data={tableData.rows}
                caption={`Contenido de la tabla ${tableData.table}`}
                emptyMessage="La tabla no tiene registros."
              />
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm font-semibold text-brand-gray">
                  Pagina {tableData.page} de {pageCount}
                </p>
                <Pagination
                  page={tableData.page}
                  pageCount={pageCount}
                  onChange={setPage}
                  label={`Paginacion de ${tableData.table}`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeveloperView;
