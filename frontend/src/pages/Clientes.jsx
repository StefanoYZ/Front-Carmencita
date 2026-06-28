import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import Alert from '../components/common/Alert.jsx';
import Loader from '../components/common/Loader.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { clientesService } from '../services/clientes.service.js';

const columns = [
  {
    header: 'Cliente',
    accessor: 'nombre_completo',
    cell: (row) => <span className="font-semibold text-brand-black">{row.nombre_completo || '-'}</span>,
  },
  { header: 'DNI', accessor: 'dni', cell: (row) => row.dni || '-' },
  { header: 'Telefono', accessor: 'telefono', cell: (row) => row.telefono || '-' },
  { header: 'Correo', accessor: 'correo', wrap: true, cell: (row) => row.correo || <span className="text-brand-gray">-</span> },
  {
    header: 'Direccion',
    accessor: 'direccion',
    wrap: true,
    className: 'max-w-[220px]',
    cell: (row) => row.direccion || <span className="text-brand-gray">-</span>,
  },
];

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClientes() {
      try {
        setLoading(true);
        setError('');
        setClientes(await clientesService.list());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'No se pudo cargar clientes.'));
      } finally {
        setLoading(false);
      }
    }

    loadClientes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="page-subtitle">Clientes guardados desde registros y pre-registros.</p>
        </div>
        <Button>Nuevo cliente</Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {loading && <Loader label="Cargando clientes..." />}

      <Card>
        <DataTable
          columns={columns}
          data={clientes}
          caption="Clientes registrados en el sistema"
          emptyMessage="Aun no hay clientes registrados."
        />
      </Card>
    </div>
  );
}

export default Clientes;
