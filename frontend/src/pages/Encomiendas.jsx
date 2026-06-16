import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { calcularCotizacion } from '../services/cotizacionesService.js';
import { deleteEncomienda, getEncomiendas } from '../services/encomiendasService.js';
import {
  descargarPdfMock,
  emitirBoletaDesdeEncomienda,
  generarPdfBetaDesdeEncomienda,
} from '../services/sunatService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getDimensions, normalizeEncomiendasList } from '../utils/encomiendas.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';
import { formatCurrency } from '../utils/formatCurrency.js';

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
    return String(value).slice(0, 10);
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

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const clearFilters = () => {
    setFilters({ fecha: '', estado: '', texto: '' });
  };

  const handleCotizar = async (row) => {
    if (row.estado === 'ANULADA') {
      setError('No se puede cotizar una encomienda anulada.');
      return;
    }

    try {
      setActionLoading(`cotizar-${row.id}`);
      setError('');
      setMessage('');
      const result = await calcularCotizacion({ encomienda_id: row.id });
      setMessage(`Cotizacion ${formatShipmentCode(result.codigo_encomienda)}: total ${formatCurrency(result.total)} ${result.moneda}.`);
      navigate(`/admin/cotizaciones?encomienda_id=${row.id}`);
    } catch (quoteError) {
      setError(getApiErrorMessage(quoteError, 'No se pudo calcular la cotizacion.'));
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
    { header: 'Codigo', accessor: 'codigo_encomienda', cell: (row) => formatShipmentCode(row.codigo_encomienda) },
    { header: 'Remitente', accessor: 'remitente_nombre' },
    { header: 'Destinatario', accessor: 'destinatario_nombre' },
    { header: 'Origen', accessor: 'origen' },
    { header: 'Destino', accessor: 'destino' },
    { header: 'Descripcion', accessor: 'descripcion' },
    { header: 'Peso', accessor: 'peso_kg', cell: (row) => `${row.peso_kg} kg` },
    { header: 'Dimensiones', accessor: 'dimensiones', cell: getDimensions },
    { header: 'Fragilidad', accessor: 'fragilidad', cell: (row) => <Badge tone="gray">{formatFragility(row.fragilidad)}</Badge> },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge tone={row.estado === 'ENTREGADA' ? 'green' : row.estado === 'ANULADA' ? 'gray' : 'amber'}>
          {row.estado || 'SIN ESTADO'}
        </Badge>
      ),
    },
    { header: 'Fecha', accessor: 'fecha_creacion', cell: (row) => row.fecha_creacion || row.created_at || '-' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="min-h-8 px-3 py-1.5" onClick={() => navigate(`/admin/encomiendas/${row.id}`)}>
            Ver detalle
          </Button>
          <Button
            variant="secondary"
            className="min-h-8 px-3 py-1.5"
            disabled={row.estado === 'ANULADA' || actionLoading === `cotizar-${row.id}`}
            onClick={() => handleCotizar(row)}
          >
            {actionLoading === `cotizar-${row.id}` ? 'Cotizando...' : 'Cotizar'}
          </Button>
          <Button className="min-h-8 px-3 py-1.5" disabled={row.estado === 'ANULADA' || actionLoading === `emitir-${row.id}`} onClick={() => handleEmitir(row)}>
            {actionLoading === `emitir-${row.id}` ? 'Emitiendo...' : 'Emitir boleta'}
          </Button>
          <Button variant="ghost" className="min-h-8 px-3 py-1.5" onClick={() => navigate(`/admin/encomiendas/${row.id}/editar`)}>
            Editar
          </Button>
          <Button variant="ghost" className="min-h-8 px-3 py-1.5" disabled={row.estado === 'ANULADA' || actionLoading === `anular-${row.id}`} onClick={() => handleAnular(row)}>
            {actionLoading === `anular-${row.id}` ? 'Anulando...' : 'Anular'}
          </Button>
        </div>
      ),
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
          <Button variant="secondary" onClick={loadRows} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
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

        {loading ? <Loader label="Cargando encomiendas..." /> : <DataTable columns={columns} data={filteredRows} />}
      </Card>
    </div>
  );
}

export default Encomiendas;

function formatFragility(value) {
  return String(value || '').trim().toUpperCase() === 'ALTA' ? 'Fragil' : 'No fragil';
}
