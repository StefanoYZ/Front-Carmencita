import React from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Clientes from '../pages/Clientes.jsx';
import Cotizacion from '../pages/Cotizacion.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import EncomiendaBuscar from '../pages/EncomiendaBuscar.jsx';
import EncomiendaDetalle from '../pages/EncomiendaDetalle.jsx';
import EncomiendaEditar from '../pages/EncomiendaEditar.jsx';
import EncomiendaNueva from '../pages/EncomiendaNueva.jsx';
import Encomiendas from '../pages/Encomiendas.jsx';
import NotFound from '../pages/NotFound.jsx';
import OptimizacionCarga from '../pages/OptimizacionCarga.jsx';
import ReniecConsulta from '../pages/ReniecConsulta.jsx';
import SunatBoletas from '../pages/SunatBoletas.jsx';
import Tracking from '../pages/Tracking.jsx';
import CotizarPublicPage from '../pages/public/CotizarPublicPage.jsx';
import HomePublicPage from '../pages/public/HomePublicPage.jsx';
import RegistrarEnvioPage from '../pages/public/RegistrarEnvioPage.jsx';
import TrackingPublicPage from '../pages/public/TrackingPublicPage.jsx';

function LegacyRedirect({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function LegacyEncomiendaRedirect({ suffix = '' }) {
  const { id } = useParams();
  const location = useLocation();
  const target = id ? `/admin/encomiendas/${id}${suffix}` : `/admin/encomiendas${suffix}`;
  return <Navigate to={`${target}${location.search}`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePublicPage />} />
        <Route path="/registrar-envio" element={<RegistrarEnvioPage />} />
        <Route path="/tracking" element={<TrackingPublicPage />} />
        <Route path="/tracking/:codigo" element={<TrackingPublicPage />} />
        <Route path="/cotizar" element={<CotizarPublicPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="encomiendas" element={<Encomiendas />} />
        <Route path="encomiendas/nueva" element={<EncomiendaNueva />} />
        <Route path="encomiendas/buscar" element={<EncomiendaBuscar />} />
        <Route path="encomiendas/:id/editar" element={<EncomiendaEditar />} />
        <Route path="encomiendas/:id" element={<EncomiendaDetalle />} />
        <Route path="cotizaciones" element={<Cotizacion />} />
        <Route path="cotizacion" element={<LegacyRedirect to="/admin/cotizaciones" />} />
        <Route path="payments" element={<Cotizacion />} />
        <Route path="yape" element={<Cotizacion />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="sunat" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
        <Route path="sunat/boletas" element={<SunatBoletas />} />
        <Route path="reniec" element={<ReniecConsulta />} />
        <Route path="optimizacion-carga" element={<OptimizacionCarga />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/clientes" element={<LegacyRedirect to="/admin/clientes" />} />
      <Route path="/encomiendas" element={<LegacyRedirect to="/admin/encomiendas" />} />
      <Route path="/encomiendas/nueva" element={<LegacyRedirect to="/admin/encomiendas/nueva" />} />
      <Route path="/encomiendas/buscar" element={<LegacyRedirect to="/admin/encomiendas/buscar" />} />
      <Route path="/encomiendas/:id/editar" element={<LegacyEncomiendaRedirect suffix="/editar" />} />
      <Route path="/encomiendas/:id" element={<LegacyEncomiendaRedirect />} />
      <Route path="/cotizacion" element={<LegacyRedirect to="/admin/cotizaciones" />} />
      <Route path="/cotizaciones" element={<LegacyRedirect to="/admin/cotizaciones" />} />
      <Route path="/sunat-boletas" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/sunat" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/sunat/boletas" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/reniec" element={<LegacyRedirect to="/admin/reniec" />} />
      <Route path="/optimizacion-carga" element={<LegacyRedirect to="/admin/optimizacion-carga" />} />
      <Route path="/payments" element={<LegacyRedirect to="/admin/payments" />} />
      <Route path="/yape" element={<LegacyRedirect to="/admin/yape" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
