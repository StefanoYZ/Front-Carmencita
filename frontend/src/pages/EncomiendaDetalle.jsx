import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import EncomiendaSummary from '../components/encomiendas/EncomiendaSummary.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { deleteEncomienda, getEncomiendaById } from '../services/encomiendasService.js';
import { descargarPdfMock, emitirBoletaDesdeEncomienda } from '../services/sunatService.js';
import { canEditEncomienda } from '../utils/encomiendas.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { extractSunatSummary } from '../utils/sunatResponse.js';

function EncomiendaDetalle() {
  const { id } = useParams();
  const [encomienda, setEncomienda] = useState(null);
  const [boleta, setBoleta] = useState(null);
  const [loading, setLoading] = useState('detalle');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading('detalle');
        setError('');
        setEncomienda(await getEncomiendaById(id));
      } catch (detailError) {
        setError(getApiErrorMessage(detailError, 'No se pudo cargar el detalle de la encomienda.'));
      } finally {
        setLoading('');
      }
    }

    loadDetail();
  }, [id]);

  const runAction = async (action, callback) => {
    try {
      setLoading(action);
      setError('');
      setMessage('');
      await callback();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'No se pudo completar la operacion.'));
    } finally {
      setLoading('');
    }
  };

  const handleEmitir = () => runAction('boleta', async () => {
    if (encomienda?.estado === 'ANULADA') {
      setError('No se puede emitir boleta para una encomienda anulada.');
      return;
    }
    const result = await emitirBoletaDesdeEncomienda({ encomienda_id: Number(id), confirmar_pago: true });
    setBoleta(extractSunatSummary(result));
  });

  const handleAnular = () => {
    const confirmed = window.confirm('¿Seguro que deseas anular esta encomienda?');
    if (!confirmed) return;

    runAction('anular', async () => {
      const result = await deleteEncomienda(id);
      setEncomienda((current) => ({ ...current, estado: result.estado || 'ANULADA' }));
      setMessage(result.message || 'Encomienda anulada correctamente.');
    });
  };

  const handlePdfMock = () => runAction('pdfMock', async () => {
    const blob = await descargarPdfMock(boleta.pdf_url, boleta.serie, boleta.numero);
    downloadBlob(blob, `boleta_${boleta.serie}_${boleta.numero}.pdf`);
    setMessage('PDF descargado correctamente.');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Detalle de encomienda</h2>
          <p className="page-subtitle">Datos completos y acciones SUNAT de la encomienda.</p>
        </div>
        <Link to="/admin/encomiendas"><Button variant="secondary">Volver al listado</Button></Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      {loading === 'detalle' && <Loader label="Cargando detalle..." />}

      {encomienda && (
        <>
          <EncomiendaSummary encomienda={encomienda} />

          <Card>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleEmitir} disabled={encomienda.estado === 'ANULADA' || loading === 'boleta'}>
                {loading === 'boleta' ? 'Emitiendo...' : 'Emitir boleta SUNAT'}
              </Button>
              {canEditEncomienda(encomienda.estado) ? (
                <Link to={`/admin/encomiendas/${id}/editar`}><Button variant="secondary">Editar</Button></Link>
              ) : (
                <Button variant="secondary" disabled title="No editable: ya esta en transito o entregada">
                  Editar
                </Button>
              )}
              <Button variant="ghost" onClick={handleAnular} disabled={encomienda.estado === 'ANULADA' || loading === 'anular'}>
                {loading === 'anular' ? 'Anulando...' : 'Anular'}
              </Button>
            </div>
          </Card>
        </>
      )}

      {boleta && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Boleta SUNAT</p>
              <h3 className="text-xl font-semibold text-brand-black">{boleta.serie}-{boleta.numero}</h3>
            </div>
            <Badge tone="green">{boleta.estado}</Badge>
          </div>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-4">
            <div><dt className="text-gray-500">Hash</dt><dd className="font-medium">{boleta.hash || '-'}</dd></div>
            <div><dt className="text-gray-500">CDR code</dt><dd className="font-medium">{boleta.cdr_code || '-'}</dd></div>
            <div><dt className="text-gray-500">Total</dt><dd className="font-medium">{formatCurrency(boleta.total)}</dd></div>
          </dl>
          {boleta.cdr_description && <Alert tone="info">{boleta.cdr_description}</Alert>}
          {boleta.cdr_notes?.length > 0 && <Alert tone="warning">{boleta.cdr_notes.join(' ')}</Alert>}
          {boleta.pdf_url && <div className="mt-4"><Button variant="secondary" onClick={handlePdfMock} disabled={loading === 'pdfMock'}>Ver PDF</Button></div>}
        </Card>
      )}
    </div>
  );
}

export default EncomiendaDetalle;
