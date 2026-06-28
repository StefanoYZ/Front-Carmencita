import React, { useEffect, useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { createDestino, getDestinos, updateDestino } from '../services/destinosService.js';

const columns = [
  { header: 'Destino', accessor: 'nombre', cell: (row) => <span className="font-semibold text-brand-black">{row.nombre}</span> },
  { header: 'Estado', accessor: 'activo', cell: (row) => <StatusBadge value={row.activo ? 'ACTIVO' : 'INACTIVO'} /> },
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
      align: 'right',
      cell: (row) => {
        const Icon = row.activo ? PowerOff : Power;
        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleToggle(row)}
              aria-label={`${row.activo ? 'Desactivar' : 'Activar'} ${row.nombre}`}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                row.activo
                  ? 'border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 focus-visible:ring-red-300'
                  : 'border-brand-green/40 text-brand-green hover:border-brand-green hover:bg-brand-lime/15 focus-visible:ring-brand-green'
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {row.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        );
      },
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
