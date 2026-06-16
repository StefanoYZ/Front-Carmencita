import React from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Clientes from '../pages/Clientes.jsx';
import Cotizacion from '../pages/Cotizacion.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Destinos from '../pages/Destinos.jsx';
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
import LoginPage from '../pages/LoginPage.jsx';
import RegistrarEnvioPage from '../pages/public/RegistrarEnvioPage.jsx';
import RegistroExitosoPage from '../pages/public/RegistroExitosoPage.jsx';
import TrackingPublicPage from '../pages/public/TrackingPublicPage.jsx';
import UsuariosInternos from '../pages/UsuariosInternos.jsx';

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
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePublicPage />} />
        <Route path="/registrar-envio" element={<RegistrarEnvioPage />} />
        <Route path="/tracking" element={<TrackingPublicPage />} />
        <Route path="/tracking/:codigo" element={<TrackingPublicPage />} />
        <Route path="/cotizar" element={<CotizarPublicPage />} />
        <Route path="/pre-registro-exitoso" element={<RegistroExitosoPage />} />
        <Route path="/registro-exitoso" element={<RegistroExitosoPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="clientes"
          element={
            <ProtectedRoute anyOf={['encomiendas.write', 'users.read']} roles={['ADMINISTRADOR', 'SECRETARIA']}>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="encomiendas"
          element={
            <ProtectedRoute anyOf={['encomiendas.read']}>
              <Encomiendas />
            </ProtectedRoute>
          }
        />
        <Route
          path="destinos"
          element={
            <ProtectedRoute anyOf={['encomiendas.write']} roles={['ADMINISTRADOR', 'SECRETARIA']}>
              <Destinos />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute anyOf={['users.read']} roles={['ADMINISTRADOR']}>
              <UsuariosInternos />
            </ProtectedRoute>
          }
        />
        <Route
          path="encomiendas/nueva"
          element={
            <ProtectedRoute anyOf={['encomiendas.write']}>
              <EncomiendaNueva />
            </ProtectedRoute>
          }
        />
        <Route
          path="encomiendas/buscar"
          element={
            <ProtectedRoute anyOf={['encomiendas.read']}>
              <EncomiendaBuscar />
            </ProtectedRoute>
          }
        />
        <Route
          path="encomiendas/:id/editar"
          element={
            <ProtectedRoute anyOf={['encomiendas.update']}>
              <EncomiendaEditar />
            </ProtectedRoute>
          }
        />
        <Route
          path="encomiendas/:id"
          element={
            <ProtectedRoute anyOf={['encomiendas.read']}>
              <EncomiendaDetalle />
            </ProtectedRoute>
          }
        />
        <Route
          path="cotizaciones"
          element={
            <ProtectedRoute anyOf={['cotizaciones.read', 'cotizaciones.calculate']}>
              <Cotizacion />
            </ProtectedRoute>
          }
        />
        <Route path="cotizacion" element={<LegacyRedirect to="/admin/cotizaciones" />} />
        <Route
          path="payments"
          element={
            <ProtectedRoute roles={['ADMINISTRADOR']}>
              <Cotizacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="yape"
          element={
            <ProtectedRoute roles={['ADMINISTRADOR']}>
              <Cotizacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="tracking"
          element={
            <ProtectedRoute anyOf={['tracking.read']}>
              <Tracking />
            </ProtectedRoute>
          }
        />
        <Route path="sunat" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
        <Route
          path="sunat/boletas"
          element={
            <ProtectedRoute anyOf={['sunat.read', 'sunat.emit', 'sunat.download_pdf']}>
              <SunatBoletas />
            </ProtectedRoute>
          }
        />
        <Route
          path="reniec"
          element={
            <ProtectedRoute anyOf={['encomiendas.write']} roles={['ADMINISTRADOR', 'SECRETARIA']}>
              <ReniecConsulta />
            </ProtectedRoute>
          }
        />
        <Route
          path="optimizacion-carga"
          element={
            <ProtectedRoute anyOf={['tracking.update_status', 'encomiendas.read']} roles={['ADMINISTRADOR', 'ESTIBA']}>
              <OptimizacionCarga />
            </ProtectedRoute>
          }
        />
        <Route
          path="estiba/optimizacion-poc"
          element={
            <ProtectedRoute anyOf={['tracking.update_status', 'encomiendas.read']} roles={['ADMINISTRADOR', 'ESTIBA']}>
              <OptimizacionCarga />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/clientes" element={<LegacyRedirect to="/admin/clientes" />} />
      <Route path="/usuarios" element={<LegacyRedirect to="/admin/usuarios" />} />
      <Route path="/encomiendas" element={<LegacyRedirect to="/admin/encomiendas" />} />
      <Route path="/destinos" element={<LegacyRedirect to="/admin/destinos" />} />
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
