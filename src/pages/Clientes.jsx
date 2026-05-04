import React from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { clientesMock } from '../data/mockData.js';

const columns = [
  { header: 'Cliente', accessor: 'nombre' },
  { header: 'DNI/RUC', accessor: 'documento' },
  { header: 'Telefono', accessor: 'telefono' },
  { header: 'Ciudad', accessor: 'ciudad' },
];

function Clientes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="page-subtitle">Listado preparado para conectarse al endpoint de clientes.</p>
        </div>
        <Button>Nuevo cliente</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={clientesMock} />
      </Card>
    </div>
  );
}

export default Clientes;
