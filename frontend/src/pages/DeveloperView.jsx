import React, { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Database,
  FileDown,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import Pagination from '../components/tables/Pagination.jsx';
import { hasAnyPermission } from '../auth/accessControl.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  createRow,
  deleteRow,
  exportTable,
  getOptimizationTestMode,
  getTableData,
  getTableSchema,
  getTables,
  setOptimizationTestMode,
  updateRow,
} from '../services/developerService.js';
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

function inputTypeFor(column) {
  if (column.python_type === 'bool') return 'checkbox';
  if (column.python_type === 'int' || column.python_type === 'float') return 'number';
  if (column.python_type === 'date') return 'date';
  if (column.python_type === 'datetime') return 'datetime-local';
  return 'text';
}

function editableColumns(schema, mode) {
  if (!schema) return [];
  return schema.columns.filter((column) => {
    if (column.is_sensitive) return false;
    if (mode === 'create' && column.is_primary_key && column.has_default) return false;
    return true;
  });
}

function RowFormPanel({ schema, mode, initialValues, onCancel, onSubmit, saving }) {
  const fields = useMemo(() => editableColumns(schema, mode), [schema, mode]);
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((column) => {
      const raw = initialValues?.[column.name];
      base[column.name] = column.python_type === 'bool' ? Boolean(raw) : raw ?? '';
    });
    return base;
  });

  const updateField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {};
    fields.forEach((column) => {
      const isPkOnUpdate = mode === 'update' && column.is_primary_key;
      if (isPkOnUpdate) return; // la clave primaria no se edita
      const raw = values[column.name];
      if (raw === '' && column.nullable) {
        payload[column.name] = null;
        return;
      }
      if (raw === '') return; // columnas no obligatorias que se dejan vacias
      payload[column.name] = raw;
    });
    onSubmit(payload);
  };

  return (
    <Card className="border-2 border-dashed border-brand-lime/60 bg-brand-surface/40">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-wider text-brand-gray">
          {mode === 'create' ? 'Nueva fila' : 'Editar fila'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar formulario"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-gray transition hover:bg-white hover:text-brand-black"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
        {fields.map((column) => {
          const type = inputTypeFor(column);
          const disabled = mode === 'update' && column.is_primary_key;

          if (type === 'checkbox') {
            return (
              <label key={column.name} className="flex items-center gap-2 pt-6 text-sm font-semibold text-brand-black">
                <input
                  type="checkbox"
                  checked={Boolean(values[column.name])}
                  onChange={(event) => updateField(column.name, event.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-lime"
                />
                {column.name}
                {column.is_primary_key && <span className="text-xs text-brand-gray">(PK)</span>}
              </label>
            );
          }

          return (
            <Input
              key={column.name}
              type={type}
              label={`${column.name}${column.is_primary_key ? ' (PK)' : ''}${!column.nullable && !column.has_default ? ' *' : ''}`}
              value={values[column.name]}
              onChange={(event) => updateField(column.name, event.target.value)}
              disabled={disabled}
              required={!column.nullable && !column.has_default && mode === 'create'}
            />
          );
        })}

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear fila' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function OptimizationTestModeCard({ canWrite, onNotify }) {
  const [status, setStatus] = useState(null); // { active, count }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOptimizationTestMode()
      .then((data) => { if (!cancelled) setStatus(data); })
      .catch(() => { if (!cancelled) setStatus({ active: false, count: 0 }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleToggle = async () => {
    if (!canWrite || saving || !status) return;
    const nextActive = !status.active;
    try {
      setSaving(true);
      const data = await setOptimizationTestMode(nextActive);
      setStatus(data);
      onNotify?.(
        'success',
        nextActive
          ? `Modo prueba ACTIVADO: se generaron ${data.count} paquetes variados para la optimizacion.`
          : 'Modo prueba APAGADO: la optimizacion usa las encomiendas reales de la web.',
      );
    } catch (toggleError) {
      onNotify?.('error', getApiErrorMessage(toggleError, 'No se pudo cambiar el modo prueba.'));
    } finally {
      setSaving(false);
    }
  };

  const active = Boolean(status?.active);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-green">
            <Boxes size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-black text-brand-black">Modo prueba de optimizacion</h3>
            <p className="mt-0.5 text-sm text-brand-gray">
              {active
                ? `Activo: la optimizacion 3D usa ${status?.count ?? 0} paquetes de prueba generados.`
                : 'Apagado: la optimizacion 3D usa las encomiendas reales registradas por la web.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Activar modo prueba de optimizacion"
          onClick={handleToggle}
          disabled={!canWrite || loading || saving}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
            active ? 'bg-brand-green' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {!canWrite && (
        <p className="mt-3 text-xs font-semibold text-brand-gray">
          Necesitas permiso de escritura para cambiar el modo prueba.
        </p>
      )}
    </Card>
  );
}

function DeveloperView() {
  const { user } = useAuth();
  const canWrite = hasAnyPermission(user, ['developer.write']);

  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [tableData, setTableData] = useState(null);
  const [schema, setSchema] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState('');
  const [formMode, setFormMode] = useState(null); // null | 'create' | 'update'
  const [editingRow, setEditingRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState('');

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
      const [dataResult, schemaResult] = await Promise.all([
        getTableData(name, { page: targetPage, pageSize: PAGE_SIZE }),
        getTableSchema(name),
      ]);
      setTableData(dataResult);
      setSchema(schemaResult);
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
    setFormMode(null);
    setEditingRow(null);
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

  const buildPk = (row) => {
    const pk = {};
    (schema?.primary_key || []).forEach((column) => {
      pk[column] = row[column];
    });
    return pk;
  };

  const handleCreateSubmit = async (payload) => {
    try {
      setSaving(true);
      setError('');
      await createRow(selected, payload);
      setMessage('Fila creada correctamente.');
      setFormMode(null);
      await Promise.all([loadTableData(selected, page), loadTables()]);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'No se pudo crear la fila.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubmit = async (payload) => {
    try {
      setSaving(true);
      setError('');
      await updateRow(selected, buildPk(editingRow), payload);
      setMessage('Fila actualizada correctamente.');
      setFormMode(null);
      setEditingRow(null);
      await loadTableData(selected, page);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'No se pudo actualizar la fila.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const pk = buildPk(row);
    const key = JSON.stringify(pk);
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar esta fila de "${selected}"? Esta accion no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      setDeletingKey(key);
      setError('');
      await deleteRow(selected, pk);
      setMessage('Fila eliminada correctamente.');
      await Promise.all([loadTableData(selected, page), loadTables()]);
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'No se pudo eliminar la fila.'));
    } finally {
      setDeletingKey('');
    }
  };

  const columns = useMemo(() => {
    if (!tableData?.columns) return [];
    const base = tableData.columns.map((column) => ({
      header: column,
      accessor: column,
      cell: (row) => <CellValue value={row[column]} />,
    }));

    if (!canWrite || !schema?.primary_key?.length) return base;

    return [
      ...base,
      {
        header: 'Acciones',
        accessor: '__acciones',
        align: 'right',
        cell: (row) => {
          const key = JSON.stringify(buildPk(row));
          const isDeleting = deletingKey === key;
          return (
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditingRow(row);
                  setFormMode('update');
                }}
                aria-label="Editar fila"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand-gray transition hover:border-brand-green hover:text-brand-green"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row)}
                disabled={isDeleting}
                aria-label="Eliminar fila"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, canWrite, schema, deletingKey]);

  const pageCount = tableData ? Math.max(1, Math.ceil(tableData.total / PAGE_SIZE)) : 1;
  const firstShown = tableData?.total ? (tableData.page - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = tableData ? Math.min(tableData.page * PAGE_SIZE, tableData.total) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="page-title">Vista Developer</h2>
          <p className="page-subtitle">
            Inspeccion de las tablas del sistema{canWrite ? ', con creacion, edicion y borrado' : ' (solo lectura)'},
            mas exportacion a CSV y Excel.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-brand-gray">
          <Database size={16} aria-hidden="true" />
          {tables.length} tablas · {totalRows.toLocaleString('es-PE')} filas totales
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <OptimizationTestModeCard
        canWrite={canWrite}
        onNotify={(tone, text) => {
          if (tone === 'success') {
            setError('');
            setMessage(text);
            loadTables();
            if (selected) loadTableData(selected, page);
          } else {
            setMessage('');
            setError(text);
          }
        }}
      />

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
                {canWrite && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setEditingRow(null);
                      setFormMode(formMode === 'create' ? null : 'create');
                    }}
                    disabled={!selected}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Nueva fila
                  </Button>
                )}
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

          {formMode && schema && (
            <RowFormPanel
              schema={schema}
              mode={formMode}
              initialValues={formMode === 'update' ? editingRow : null}
              saving={saving}
              onCancel={() => {
                setFormMode(null);
                setEditingRow(null);
              }}
              onSubmit={formMode === 'create' ? handleCreateSubmit : handleUpdateSubmit}
            />
          )}

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
