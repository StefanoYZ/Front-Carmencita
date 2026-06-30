import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ClipboardList, Package, Truck } from 'lucide-react';
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
  const allowedLinks = getAllowedNavigation(user).filter((item) => item.path !== '/admin/dashboard');
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
      { label: 'Encomiendas totales', value: shipments.length, accent: 'bg-brand-green', icon: Package, ring: 'from-brand-green/15 to-brand-green/5 text-brand-green' },
      { label: 'En proceso', value: active, accent: 'bg-brand-dark', icon: Truck, ring: 'from-brand-dark/15 to-brand-dark/5 text-brand-dark' },
      { label: 'Entregadas', value: delivered, accent: 'bg-brand-lime', icon: CheckCircle2, ring: 'from-brand-lime/30 to-brand-lime/10 text-brand-dark' },
      { label: 'Pre-registros', value: preRegistered, accent: 'bg-brand-gray', icon: ClipboardList, ring: 'from-brand-gray/15 to-brand-gray/5 text-brand-gray' },
    ];
  }, [shipments]);
  const statusDistribution = useMemo(() => {
    const groups = [
      {
        label: 'Pendientes',
        value: shipments.filter((shipment) => ['PRE_REGISTRADA', 'REGISTRADA', 'COTIZADA', 'PAGO_CONFIRMADO', 'BOLETA_EMITIDA'].includes(shipment.estado)).length,
        color: '#A3CF84',
      },
      {
        label: 'En camino',
        value: shipments.filter((shipment) => shipment.estado === 'EN_TRANSITO').length,
        color: '#28A745',
      },
      {
        label: 'Entregadas',
        value: shipments.filter((shipment) => shipment.estado === 'ENTREGADA').length,
        color: '#3C5940',
      },
      {
        label: 'Anuladas',
        value: shipments.filter((shipment) => shipment.estado === 'ANULADA').length,
        color: '#6C757D',
      },
    ];
    const total = Math.max(shipments.length, 1);
    let offset = 0;
    const segments = groups.map((group) => {
      const start = offset;
      offset += (group.value / total) * 100;
      return `${group.color} ${start}% ${offset}%`;
    });
    return {
      groups,
      max: Math.max(...groups.map((group) => group.value), 1),
      gradient: shipments.length ? `conic-gradient(${segments.join(', ')})` : '#E4ECE2',
    };
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f4d2f] via-brand-dark to-[#16331f] px-6 py-7 shadow-[0_20px_50px_-20px_rgba(33,37,41,0.5)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 h-44 w-44 rounded-full bg-brand-lime/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">Panel operativo</p>
            <h2 className="mt-1.5 text-3xl font-black tracking-tight text-white">Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
              Resumen operativo para {user?.full_name || user?.username || 'usuario interno'}.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <p className="font-bold text-white">{(user?.roles || []).join(', ') || 'Sin rol asignado'}</p>
            <p className="mt-1 text-brand-lime/90">{user?.permissions?.length || 0} permisos habilitados</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`} />
              <div className="flex items-start justify-between gap-3 pl-2">
                <div>
                  <p className="text-sm font-semibold text-brand-gray">{stat.label}</p>
                  <strong className="mt-3 block text-4xl font-black tracking-tight text-brand-black">{stat.value}</strong>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.ring}`}>
                  <Icon size={20} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div>
            <h3 className="text-lg font-black text-brand-black">Encomiendas por estado</h3>
            <p className="mt-1 text-sm text-brand-gray">Distribucion operativa de los registros actuales.</p>
          </div>
          <div className="mt-6 space-y-4">
            {statusDistribution.groups.map((group) => (
              <div key={group.label} className="grid grid-cols-[90px_1fr_36px] items-center gap-3">
                <span className="text-sm font-semibold text-brand-black">{group.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-brand-surface">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(group.value / statusDistribution.max) * 100}%`, backgroundColor: group.color }}
                  />
                </div>
                <strong className="text-right text-sm text-brand-black">{group.value}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-black text-brand-black">Distribucion porcentual</h3>
          <div className="mt-5 flex items-center justify-center gap-7">
            <div
              className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
              style={{ background: statusDistribution.gradient }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <strong className="block text-2xl text-brand-black">{shipments.length}</strong>
                  <span className="text-xs font-semibold text-brand-gray">Total</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {statusDistribution.groups.map((group) => (
                <div key={group.label} className="flex items-center gap-2 text-xs font-semibold text-brand-gray">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                  {group.label}
                </div>
              ))}
            </div>
          </div>
        </Card>
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
              className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-brand-surface p-4 text-sm font-bold text-brand-black transition duration-200 hover:-translate-y-0.5 hover:border-brand-lime hover:bg-brand-lime/15 hover:shadow-[0_12px_26px_-14px_rgba(33,37,41,0.3)]"
            >
              <span>
                <span className="block">{item.label}</span>
                <span className="mt-2 block text-xs font-semibold text-brand-gray group-hover:text-brand-dark">Abrir modulo</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-gray shadow-sm transition group-hover:bg-brand-green group-hover:text-white">
                <ArrowUpRight size={17} />
              </span>
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
          <DataTable columns={columns} data={latestShipments} emptyMessage="Aun no hay encomiendas registradas." caption="Ultimas encomiendas registradas en el sistema" />
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
