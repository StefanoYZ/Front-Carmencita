import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import EncomiendaForm from '../components/encomiendas/EncomiendaForm.jsx';
import EncomiendaSummary from '../components/encomiendas/EncomiendaSummary.jsx';
import { createEncomienda } from '../services/encomiendasService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import {
  buildEncomiendaPayload,
  emptyEncomiendaForm,
  sanitizeEncomiendaField,
  validateEncomiendaForm,
  validateEncomiendaFormFields,
} from '../utils/encomiendas.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';

function EncomiendaNueva() {
  const [form, setForm] = useState(emptyEncomiendaForm);
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: sanitizeEncomiendaField(name, value, current) };
      if (name.endsWith('_tipo_documento') && value === 'DNI') {
        const prefix = name.replace('_tipo_documento', '');
        const documentField = `${prefix}_numero_documento`;
        next[documentField] = sanitizeEncomiendaField(documentField, next[documentField], next);
      }
      return next;
    });
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationFields = validateEncomiendaFormFields(form);
    const validationErrors = validateEncomiendaForm(form);
    if (validationErrors.length > 0) {
      setFieldErrors(validationFields);
      setError(validationErrors.join(' '));
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});
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
        <EncomiendaForm form={form} errors={fieldErrors} onChange={updateField} onSubmit={handleSubmit} loading={loading} />
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
