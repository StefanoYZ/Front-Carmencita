import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllowedNavigation } from '../auth/accessControl.js';
import Alert from '../components/common/Alert.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getEncomiendas } from '../services/encomiendasService.js';

const columns = [
  { header: 'Codigo', accessor: 'codigo_encomienda' },
  { header: 'Destinatario', accessor: 'destinatario_nombre' },
  { header: 'Destino', accessor: 'destino' },
  { header: 'Peso', accessor: 'peso_kg', cell: (row) => `${row.peso_kg || '-'} kg` },
  {
    header: 'Estado',
    accessor: 'estado',
    cell: (row) => <Badge tone={row.estado === 'ENTREGADA' ? 'green' : row.estado === 'ANULADA' ? 'gray' : 'amber'}>{row.estado}</Badge>,
  },
];

function sortShipmentsByRecent(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.fecha_creacion || a.created_at || 0).getTime();
    const bTime = new Date(b.fecha_creacion || b.created_at || 0).getTime();
    if (bTime !== aTime) return bTime - aTime;
    return Number(b.id || 0) - Number(a.id || 0);
  });
}

function Dashboard() {
  const { user } = useAuth();
  const allowedLinks = getAllowedNavigation(user).filter((item) => item.path !== '/admin');
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [shipmentsError, setShipmentsError] = useState('');

  useEffect(() => {
    async function loadShipments() {
      try {
        setLoadingShipments(true);
        setShipmentsError('');
        setShipments(await getEncomiendas());
      } catch (error) {
        setShipmentsError(getApiErrorMessage(error, 'No se pudo cargar las ultimas encomiendas.'));
      } finally {
        setLoadingShipments(false);
      }
    }

    loadShipments();
  }, []);

  const latestShipments = useMemo(() => sortShipmentsByRecent(shipments).slice(0, 5), [shipments]);
  const dashboardStats = useMemo(() => {
    const active = shipments.filter((shipment) => !['ENTREGADA', 'ANULADA'].includes(shipment.estado)).length;
    const delivered = shipments.filter((shipment) => shipment.estado === 'ENTREGADA').length;
    const preRegistered = shipments.filter((shipment) => shipment.estado === 'PRE_REGISTRADA').length;
    return [
      { label: 'Encomiendas totales', value: shipments.length, accent: 'bg-brand-green' },
      { label: 'En proceso', value: active, accent: 'bg-brand-dark' },
      { label: 'Entregadas', value: delivered, accent: 'bg-brand-lime' },
      { label: 'Pre-registros', value: preRegistered, accent: 'bg-brand-gray' },
    ];
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_12px_30px_rgba(33,37,41,0.06)]">
        <div className="flex flex-col gap-4 border-l-4 border-brand-green px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Panel operativo</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-brand-black">Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-gray">
              Resumen operativo para {user?.full_name || user?.username || 'usuario interno'}.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-brand-surface px-4 py-3 text-sm">
            <p className="font-bold text-brand-black">{(user?.roles || []).join(', ') || 'Sin rol asignado'}</p>
            <p className="mt-1 text-brand-gray">{user?.permissions?.length || 0} permisos habilitados</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`} />
            <p className="pl-2 text-sm font-semibold text-brand-gray">{stat.label}</p>
            <div className="mt-4 pl-2">
              <strong className="text-4xl font-black tracking-tight text-brand-black">{stat.value}</strong>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div>
          <h3 className="text-lg font-black text-brand-black">Modulos disponibles</h3>
          <p className="mt-1 text-sm text-brand-gray">Accesos habilitados para tu rol.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {allowedLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group rounded-lg border border-gray-200 bg-brand-surface p-4 text-sm font-bold text-brand-black transition hover:-translate-y-0.5 hover:border-brand-lime hover:bg-brand-lime/20 hover:shadow-sm"
            >
              <span>{item.label}</span>
              <span className="mt-3 block text-xs font-semibold text-brand-gray group-hover:text-brand-dark">Abrir modulo</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-black text-brand-black">Ultimas encomiendas</h3>
          <p className="mt-1 text-sm text-brand-gray">Movimientos recientes registrados en el sistema.</p>
        </div>
        {shipmentsError && <Alert tone="error">{shipmentsError}</Alert>}
        {loadingShipments ? (
          <Loader label="Cargando ultimas encomiendas..." />
        ) : (
          <DataTable columns={columns} data={latestShipments} emptyMessage="Aun no hay encomiendas registradas." />
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
