import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import EncomiendaForm from '../components/encomiendas/EncomiendaForm.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getEncomiendaById, updateEncomienda } from '../services/encomiendasService.js';
import {
  buildEncomiendaPayload,
  normalizeEncomiendaForForm,
  validateEncomiendaForm,
} from '../utils/encomiendas.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';

function EncomiendaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [encomienda, setEncomienda] = useState(null);
  const [loading, setLoading] = useState('detalle');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadEncomienda() {
      try {
        setLoading('detalle');
        setError('');
        const data = await getEncomiendaById(id);
        setEncomienda(data);
        setForm(normalizeEncomiendaForForm(data));
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'No se pudo cargar la encomienda.'));
      } finally {
        setLoading('');
      }
    }

    loadEncomienda();
  }, [id]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateEncomiendaForm(form, { includeEstado: true });
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    try {
      setLoading('guardar');
      setError('');
      setMessage('');
      const updated = await updateEncomienda(id, buildEncomiendaPayload(form));
      setEncomienda(updated);
      setForm(normalizeEncomiendaForForm(updated));
      setMessage('Encomienda actualizada correctamente.');
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, 'Error al actualizar la encomienda.'));
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Editar encomienda</h2>
          <p className="page-subtitle">Actualiza datos permitidos. El codigo no se puede modificar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/encomiendas/${id}`}><Button variant="secondary">Ver detalle</Button></Link>
          <Button variant="ghost" onClick={() => navigate('/admin/encomiendas')}>Volver al listado</Button>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      {loading === 'detalle' && <Loader label="Cargando encomienda..." />}

      {form && (
        <Card>
          <EncomiendaForm
            form={form}
            onChange={updateField}
            onSubmit={handleSubmit}
            loading={loading === 'guardar'}
            mode="edit"
            codigoEncomienda={formatShipmentCode(encomienda?.codigo_encomienda)}
          />
        </Card>
      )}
    </div>
  );
}

export default EncomiendaEditar;
