import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import EncomiendaSummary from '../components/encomiendas/EncomiendaSummary.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getEncomiendaByCodigo } from '../services/encomiendasService.js';
import { parseShipmentCode } from '../utils/formatShipmentCode.js';

function EncomiendaBuscar() {
  const [codigo, setCodigo] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setResult(null);
      setResult(await getEncomiendaByCodigo(parseShipmentCode(codigo)));
    } catch (searchError) {
      setError(getApiErrorMessage(searchError, 'No se encontro la encomienda solicitada.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Buscar encomienda</h2>
        <p className="page-subtitle">Busca por codigo generado por el backend, por ejemplo D000000001.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex-1">
            <Input label="Codigo de encomienda" value={codigo} onChange={(event) => setCodigo(event.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</Button>
        </form>
      </Card>

      {loading && <Loader label="Buscando encomienda..." />}
      {result && (
        <>
          <EncomiendaSummary encomienda={result} />
          <Link to={`/admin/encomiendas/${result.id}`}><Button>Ver detalle completo</Button></Link>
        </>
      )}
    </div>
  );
}

export default EncomiendaBuscar;
