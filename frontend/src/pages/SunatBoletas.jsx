import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  descargarPdfMock,
  emitirBoletaDesdeEncomienda,
  generarPdfBetaDesdeEncomienda,
  generarXmlBetaDesdeEncomienda,
} from '../services/sunatService.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';
import { extractSunatSummary } from '../utils/sunatResponse.js';

function SunatBoletas() {
  const [searchParams] = useSearchParams();
  const [encomiendaId, setEncomiendaId] = useState(searchParams.get('encomienda_id') || '');
  const [boleta, setBoleta] = useState(null);
  const [xmlResponse, setXmlResponse] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const runAction = async (actionName, action) => {
    try {
      setLoading(actionName);
      setError('');
      setMessage('');
      await action();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'No se pudo completar la operacion SUNAT.'));
    } finally {
      setLoading('');
    }
  };

  const payload = () => ({ encomienda_id: Number(encomiendaId), confirmar_pago: true });

  const handleEmitir = (event) => {
    event.preventDefault();
    runAction('emitir', async () => {
      const response = await emitirBoletaDesdeEncomienda(payload());
      const summary = extractSunatSummary(response);
      setBoleta(summary);
      setXmlResponse(null);
      setMessage(summary.mensaje || 'Boleta emitida correctamente.');
    });
  };

  const handlePdfMock = () => runAction('pdfMock', async () => {
    const blob = await descargarPdfMock(boleta.pdf_url, boleta.serie, boleta.numero);
    downloadBlob(blob, `boleta_${boleta.serie}_${boleta.numero}.pdf`);
    setMessage('PDF descargado correctamente.');
  });

  const handlePdfBeta = () => runAction('pdfBeta', async () => {
    const blob = await generarPdfBetaDesdeEncomienda(payload());
    downloadBlob(blob, `boleta_${formatShipmentCode(boleta?.codigo_encomienda) || encomiendaId}.pdf`);
    setMessage('PDF generado correctamente.');
  });

  const handleXmlBeta = () => runAction('xmlBeta', async () => {
    setXmlResponse(await generarXmlBetaDesdeEncomienda(payload()));
    setMessage('XML generado correctamente.');
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">SUNAT / Boletas</h2>
        <p className="page-subtitle">Emision de boletas desde encomienda. No incluye pasarela de pago.</p>
      </div>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <form className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]" onSubmit={handleEmitir}>
          <Input
            label="ID de encomienda"
            name="encomienda_id"
            type="number"
            min="1"
            value={encomiendaId}
            onChange={(event) => setEncomiendaId(event.target.value)}
            required
          />
          <div className="flex items-end">
            <Button type="submit" disabled={loading === 'emitir'}>{loading === 'emitir' ? 'Emitiendo...' : 'Emitir boleta'}</Button>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={handlePdfBeta} disabled={!encomiendaId || loading === 'pdfBeta'}>
              {loading === 'pdfBeta' ? 'Generando...' : 'Generar PDF'}
            </Button>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={handleXmlBeta} disabled={!encomiendaId || loading === 'xmlBeta'}>
              {loading === 'xmlBeta' ? 'Generando...' : 'Generar XML'}
            </Button>
          </div>
        </form>
      </Card>

      {loading && <Loader label="Procesando solicitud SUNAT..." />}

      {boleta && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Comprobante</p>
              <h3 className="text-xl font-semibold text-brand-black">{boleta.serie}-{boleta.numero}</h3>
            </div>
            <Badge tone={boleta.ambiente === 'mock' ? 'amber' : 'green'}>{boleta.estado}</Badge>
          </div>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-4">
            <div><dt className="text-gray-500">Success</dt><dd className="font-medium text-brand-black">{String(boleta.success)}</dd></div>
            <div><dt className="text-gray-500">Fecha</dt><dd className="font-medium text-brand-black">{boleta.fecha_emision}</dd></div>
            <div><dt className="text-gray-500">Codigo encomienda</dt><dd className="font-medium text-brand-black">{formatShipmentCode(boleta.codigo_encomienda)}</dd></div>
            <div><dt className="text-gray-500">Subtotal</dt><dd className="font-medium text-brand-black">{formatCurrency(boleta.subtotal)}</dd></div>
            <div><dt className="text-gray-500">IGV</dt><dd className="font-medium text-brand-black">{formatCurrency(boleta.igv)}</dd></div>
            <div><dt className="text-gray-500">Total</dt><dd className="font-medium text-brand-black">{formatCurrency(boleta.total)}</dd></div>
            <div><dt className="text-gray-500">Moneda</dt><dd className="font-medium text-brand-black">{boleta.moneda}</dd></div>
            <div className="md:col-span-2"><dt className="text-gray-500">Hash</dt><dd className="break-all font-medium text-brand-black">{boleta.hash || '-'}</dd></div>
            <div><dt className="text-gray-500">CDR code</dt><dd className="font-medium text-brand-black">{boleta.cdr_code || '-'}</dd></div>
            <div><dt className="text-gray-500">CDR</dt><dd className="break-all font-medium text-brand-black">{boleta.cdr || '-'}</dd></div>
          </dl>
          {boleta.mensaje && <p className="mt-4 text-sm text-gray-600">{boleta.mensaje}</p>}
          {boleta.cdr_description && <div className="mt-4"><Alert tone="info">{boleta.cdr_description}</Alert></div>}
          {boleta.cdr_notes?.length > 0 && <div className="mt-4"><Alert tone="warning">{boleta.cdr_notes.join(' ')}</Alert></div>}
          {boleta.pdf_url && (
            <div className="mt-5">
              <Button type="button" variant="secondary" onClick={handlePdfMock} disabled={loading === 'pdfMock'}>
                {loading === 'pdfMock' ? 'Descargando...' : 'Abrir / descargar PDF'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {xmlResponse && (
        <Card>
          <h3 className="text-lg font-semibold text-brand-black">Respuesta XML</h3>
          <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
            {typeof xmlResponse === 'string' ? xmlResponse : JSON.stringify(xmlResponse, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

export default SunatBoletas;
