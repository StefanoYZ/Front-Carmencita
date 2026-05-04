import React from 'react';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { dashboardStats, encomiendasMock } from '../data/mockData.js';

const columns = [
  { header: 'Codigo', accessor: 'id' },
  { header: 'Destinatario', accessor: 'destinatario' },
  { header: 'Destino', accessor: 'destino' },
  { header: 'Peso', accessor: 'peso', cell: (row) => `${row.peso} kg` },
  {
    header: 'Estado',
    accessor: 'estado',
    cell: (row) => <Badge tone={row.estado === 'Entregada' ? 'green' : 'amber'}>{row.estado}</Badge>,
  },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Resumen operativo de encomiendas, clientes y carga.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <strong className="text-3xl font-semibold text-brand-black">{stat.value}</strong>
              <Badge tone="green">{stat.trend}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-black">Ultimas encomiendas</h3>
          <Badge tone="gray">Simulado</Badge>
        </div>
        <DataTable columns={columns} data={encomiendasMock} />
      </Card>
    </div>
  );
}

export default Dashboard;
