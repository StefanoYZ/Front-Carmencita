import React, { useEffect, useState } from 'react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { createDestino, getDestinos, updateDestino } from '../services/destinosService.js';

const columns = [
  { header: 'Destino', accessor: 'nombre' },
  { header: 'Estado', accessor: 'activo', cell: (row) => (row.activo ? 'Activo' : 'Inactivo') },
];

function Destinos() {
  const [destinos, setDestinos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadDestinos() {
    try {
      setLoading(true);
      setError('');
      setDestinos(await getDestinos({ incluirInactivos: true }));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar destinos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDestinos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = nombre.trim();
    if (normalized.length < 2) {
      setError('Ingresa un destino valido.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await createDestino({ nombre: normalized });
      setNombre('');
      setMessage('Destino agregado correctamente.');
      await loadDestinos();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'No se pudo agregar el destino.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (destino) => {
    try {
      setError('');
      setMessage('');
      await updateDestino(destino.id, { activo: !destino.activo });
      await loadDestinos();
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, 'No se pudo actualizar el destino.'));
    }
  };

  const tableColumns = [
    ...columns,
    {
      header: 'Accion',
      accessor: 'accion',
      cell: (row) => (
        <button
          type="button"
          className="font-semibold text-brand-green hover:text-brand-dark"
          onClick={() => handleToggle(row)}
        >
          {row.activo ? 'Desactivar' : 'Activar'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Destinos</h2>
        <p className="page-subtitle">Catalogo usado como sugerencia para origen y destino en encomiendas.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card>
        <form className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" onSubmit={handleSubmit}>
          <Input
            label="Nuevo destino"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ej. Mollepata"
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Agregar'}
          </Button>
        </form>
      </Card>

      {loading && <Loader label="Cargando destinos..." />}

      <Card>
        <DataTable columns={tableColumns} data={destinos} />
      </Card>
    </div>
  );
}

export default Destinos;
