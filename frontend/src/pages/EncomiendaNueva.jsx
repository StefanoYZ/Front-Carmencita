import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import EncomiendaForm from '../components/encomiendas/EncomiendaForm.jsx';
import EncomiendaSummary from '../components/encomiendas/EncomiendaSummary.jsx';
import { createEncomienda } from '../services/encomiendasService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { buildEncomiendaPayload, emptyEncomiendaForm, validateEncomiendaForm } from '../utils/encomiendas.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';

function EncomiendaNueva() {
  const [form, setForm] = useState(emptyEncomiendaForm);
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateEncomiendaForm(form);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await createEncomienda(buildEncomiendaPayload(form));
      setCreated(result);
      setForm(emptyEncomiendaForm);
    } catch (createError) {
      setError(getApiErrorMessage(createError, 'No se pudo registrar la encomienda.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Nueva encomienda</h2>
        <p className="page-subtitle">El codigo se genera automaticamente en el backend.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {created && (
        <Alert tone="success">
          Encomienda registrada correctamente. Codigo generado: <strong>{formatShipmentCode(created.codigo_encomienda)}</strong>
        </Alert>
      )}

      <Card>
        <EncomiendaForm form={form} onChange={updateField} onSubmit={handleSubmit} loading={loading} />
      </Card>

      {created && (
        <>
          <EncomiendaSummary encomienda={created} />
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/encomiendas/${created.id}`}><Button>Ver detalle</Button></Link>
            <Link to={`/admin/cotizaciones?encomienda_id=${created.id}`}><Button variant="secondary">Calcular cotizacion</Button></Link>
            <Link to={`/admin/sunat/boletas?encomienda_id=${created.id}`}><Button variant="secondary">Emitir boleta SUNAT</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}

export default EncomiendaNueva;
