import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ban, Eye, FileSpreadsheet, FileText, Loader2, Pencil } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import FragilityBadge from '../components/common/FragilityBadge.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import Pagination from '../components/tables/Pagination.jsx';
import {
  deleteEncomienda,
  exportarReporteEncomiendas,
  getEncomiendas,
} from '../services/encomiendasService.js';
import {
  descargarPdfMock,
  emitirBoletaDesdeEncomienda,
  generarPdfBetaDesdeEncomienda,
} from '../services/sunatService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { canEditEncomienda, getDimensions, normalizeEncomiendasList, sortEncomiendasByRecent } from '../utils/encomiendas.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatDateInput, formatDateTime } from '../utils/formatDate.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';

const PAGE_SIZE = 35;

function Encomiendas() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    fecha: '',
    estado: '',
    texto: '',
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);

  async function loadRows() {
    try {
      setLoading(true);
      setError('');
      const data = await getEncomiendas();
      setRows(normalizeEncomiendasList(data));
      if (normalizeEncomiendasList(data).length === 0) {
        setMessage('No hay encomiendas registradas en PostgreSQL.');
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo listar encomiendas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  const getRowDate = (row) => {
    const value = row.fecha_creacion || row.created_at;
    if (!value) return '';
    return formatDateInput(value);
  };

  const filteredRows = rows.filter((row) => {
    const textFilter = filters.texto.trim().toLowerCase();
    const matchesDate = !filters.fecha || getRowDate(row) === filters.fecha;
    const matchesStatus = !filters.estado || row.estado === filters.estado;
    const matchesText =
      !textFilter ||
      [
        formatShipmentCode(row.codigo_encomienda),
        row.remitente_nombre,
        row.destinatario_nombre,
        row.origen,
        row.destino,
        row.descripcion,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(textFilter));

    return matchesDate && matchesStatus && matchesText;
  });

  // Mas recientes primero: la pagina 1 muestra las ultimas encomiendas.
  const sortedRows = useMemo(() => sortEncomiendasByRecent(filteredRows), [filteredRows]);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstShown = sortedRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(currentPage * PAGE_SIZE, sortedRows.length);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ fecha: '', estado: '', texto: '' });
    setPage(1);
  };

  const handleExport = async (format) => {
    try {
      setActionLoading(`export-${format}`);
      setError('');
      const blob = await exportarReporteEncomiendas(format, filters);
      const dateSuffix = filters.fecha || new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `reporte_encomiendas_${dateSuffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      setMessage(`Reporte ${format === 'excel' ? 'Excel' : 'PDF'} descargado correctamente.`);
    } catch (exportError) {
      setError(getApiErrorMessage(exportError, 'No se pudo exportar el reporte.'));
    } finally {
      setActionLoading('');
    }
  };

  const handleEmitir = async (row) => {
    if (row.estado === 'ANULADA') {
      setError('No se puede emitir boleta para una encomienda anulada.');
      return;
    }

    try {
      setActionLoading(`emitir-${row.id}`);
      setError('');
      setMessage('');
      const result = await emitirBoletaDesdeEncomienda({ encomienda_id: row.id, confirmar_pago: true });
      const formattedCode = formatShipmentCode(result.codigo_encomienda || row.codigo_encomienda);

      if (result.pdf_url) {
        const pdf = await descargarPdfMock(result.pdf_url, result.serie, result.numero);
        downloadBlob(pdf, `boleta_${result.serie}_${result.numero}_${formattedCode}.pdf`);
        setMessage(`Boleta ${result.serie}-${result.numero} emitida y PDF descargado para ${formattedCode}.`);
        return;
      }

      if (result.ambiente === 'beta') {
        const pdf = await generarPdfBetaDesdeEncomienda({ encomienda_id: row.id, confirmar_pago: true });
        downloadBlob(pdf, `boleta_${formattedCode}.pdf`);
        setMessage(`Boleta ${result.serie}-${result.numero} emitida y PDF descargado para ${formattedCode}.`);
        return;
      }

      setMessage(`Boleta ${result.serie}-${result.numero} emitida para ${formattedCode}, pero la respuesta no trajo PDF disponible.`);
    } catch (sunatError) {
      setError(getApiErrorMessage(sunatError, 'No se pudo emitir o descargar la boleta SUNAT.'));
    } finally {
      setActionLoading('');
    }
  };

  const handleAnular = async (row) => {
    const confirmed = window.confirm('¿Seguro que deseas anular esta encomienda?');
    if (!confirmed) return;

    try {
      setActionLoading(`anular-${row.id}`);
      setError('');
      setMessage('');
      const result = await deleteEncomienda(row.id);
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? { ...item, estado: result.estado || 'ANULADA' }
            : item,
        ),
      );
      setMessage(result.message || 'Encomienda anulada correctamente.');
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Error al anular la encomienda.'));
    } finally {
      setActionLoading('');
    }
  };

  const columns = [
    {
      header: 'Codigo',
      accessor: 'codigo_encomienda',
      cell: (row) => <span className="font-black text-brand-black">{formatShipmentCode(row.codigo_encomienda)}</span>,
    },
    {
      header: 'Remitente / Destinatario',
      accessor: 'remitente_nombre',
      cell: (row) => (
        <div className="leading-tight">
          <p className="font-semibold text-brand-black">{row.remitente_nombre || '-'}</p>
          <p className="mt-0.5 text-xs text-brand-gray">
            <span aria-hidden="true">&rarr; </span>{row.destinatario_nombre || '-'}
          </p>
        </div>
      ),
    },
    {
      header: 'Ruta',
      accessor: 'origen',
      cell: (row) => (
        <span className="font-medium text-brand-black">
          {row.origen || '-'} <span className="text-brand-gray" aria-hidden="true">&rarr;</span> {row.destino || '-'}
        </span>
      ),
    },
    {
      header: 'Descripcion',
      accessor: 'descripcion',
      wrap: true,
      className: 'max-w-[200px]',
      cell: (row) => (
        <p className="line-clamp-2 text-sm text-brand-gray" title={row.descripcion || ''}>
          {row.descripcion || '-'}
        </p>
      ),
    },
    {
      header: 'Carga',
      accessor: 'peso_kg',
      cell: (row) => (
        <div className="leading-tight">
          <p className="font-semibold text-brand-black">{row.peso_kg ? `${row.peso_kg} kg` : '-'}</p>
          <p className="mt-0.5 text-xs text-brand-gray">{getDimensions(row)}</p>
        </div>
      ),
    },
    { header: 'Fragilidad', accessor: 'fragilidad', cell: (row) => <FragilityBadge value={row.fragilidad} /> },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => <StatusBadge value={row.estado} />,
    },
    {
      header: 'Fecha',
      accessor: 'fecha_creacion',
      cell: (row) => {
        const value = row.fecha_creacion || row.created_at;
        return <span className="text-sm text-brand-gray">{value ? formatDateTime(value) : '-'}</span>;
      },
    },
    {
      header: 'Acciones',
      accessor: 'acciones',
      align: 'right',
      cell: (row) => {
        const anulada = row.estado === 'ANULADA';
        const editable = canEditEncomienda(row.estado);
        return (
          <div className="flex flex-nowrap items-center justify-end gap-1.5">
            <IconAction icon={Eye} label="Ver detalle" onClick={() => navigate(`/admin/encomiendas/${row.id}`)} />
            <IconAction
              icon={FileText}
              label="Emitir boleta"
              loading={actionLoading === `emitir-${row.id}`}
              disabled={anulada || actionLoading === `emitir-${row.id}`}
              onClick={() => handleEmitir(row)}
            />
            <IconAction
              icon={Pencil}
              label={editable ? 'Editar' : 'No editable: ya esta en transito o entregada'}
              disabled={!editable}
              onClick={() => navigate(`/admin/encomiendas/${row.id}/editar`)}
            />
            <IconAction
              icon={Ban}
              label="Anular"
              danger
              loading={actionLoading === `anular-${row.id}`}
              disabled={anulada || actionLoading === `anular-${row.id}`}
              onClick={() => handleAnular(row)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Encomiendas</h2>
          <p className="page-subtitle">Listado conectado a FastAPI y PostgreSQL.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/encomiendas/buscar"><Button variant="secondary">Buscar por codigo</Button></Link>
          <Link to="/admin/encomiendas/nueva"><Button>Nueva encomienda</Button></Link>
        </div>
      </div>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-brand-black">Listado de encomiendas</h3>
            <p className="mt-1 text-sm text-brand-gray">Filtra por fecha, estado o datos principales.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => handleExport('excel')}
              disabled={Boolean(actionLoading)}
            >
              <FileSpreadsheet size={17} />
              {actionLoading === 'export-excel' ? 'Exportando...' : 'Excel'}
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => handleExport('pdf')}
              disabled={Boolean(actionLoading)}
            >
              <FileText size={17} />
              {actionLoading === 'export-pdf' ? 'Exportando...' : 'PDF'}
            </Button>
            <Button variant="secondary" onClick={loadRows} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-lg border border-gray-200 bg-brand-surface p-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-black">Buscar en lista</span>
            <input
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
              name="texto"
              value={filters.texto}
              onChange={updateFilter}
              placeholder="Codigo, remitente, destino..."
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-black">Dia</span>
            <input
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
              name="fecha"
              type="date"
              value={filters.fecha}
              onChange={updateFilter}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-black">Estado</span>
            <select
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
              name="estado"
              value={filters.estado}
              onChange={updateFilter}
            >
              <option value="">Todos</option>
              <option value="REGISTRADA">REGISTRADA</option>
              <option value="COTIZADA">COTIZADA</option>
              <option value="PAGO_CONFIRMADO">PAGO_CONFIRMADO</option>
              <option value="BOLETA_EMITIDA">BOLETA_EMITIDA</option>
              <option value="EN_TRANSITO">EN_TRANSITO</option>
              <option value="ENTREGADA">ENTREGADA</option>
              <option value="ANULADA">ANULADA</option>
            </select>
          </label>
          <Button variant="ghost" onClick={clearFilters}>Limpiar</Button>
        </div>

        {loading ? (
          <Loader label="Cargando encomiendas..." />
        ) : (
          <>
            <DataTable columns={columns} data={pagedRows} caption="Listado de encomiendas registradas" />
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs font-semibold text-brand-gray">
                {sortedRows.length > 0
                  ? `Mostrando ${firstShown}–${lastShown} de ${sortedRows.length}`
                  : 'Sin resultados'}
              </p>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}


export default Encomiendas;

function IconAction({ icon: Icon, label, onClick, disabled = false, loading = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 focus-visible:ring-red-300'
          : 'border-gray-200 text-brand-dark hover:border-brand-green hover:bg-brand-surface focus-visible:ring-brand-green'
      }`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
    </button>
  );
}
