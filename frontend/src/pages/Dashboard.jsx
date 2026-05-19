import React from 'react';
import { Link } from 'react-router-dom';
import { getAllowedNavigation } from '../auth/accessControl.js';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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
  const { user } = useAuth();
  const allowedLinks = getAllowedNavigation(user).filter((item) => item.path !== '/admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Resumen operativo para {user?.full_name || user?.username || 'usuario interno'}.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold text-brand-black">{(user?.roles || []).join(', ') || 'Sin rol asignado'}</p>
          <p className="mt-1 text-gray-500">{user?.permissions?.length || 0} permisos habilitados</p>
        </div>
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-brand-black">Modulos disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">Accesos habilitados para tu rol.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {allowedLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-700 transition hover:border-brand-green hover:bg-green-50 hover:text-brand-black"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Card>

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
