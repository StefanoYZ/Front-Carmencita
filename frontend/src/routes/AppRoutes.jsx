import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { getRoleHomePath } from '../auth/accessControl.js';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import AgencyRouteGuard from '../components/auth/AgencyRouteGuard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import StowageLayout from '../layouts/StowageLayout.jsx';
import Clientes from '../pages/Clientes.jsx';
import AgenciaDetalle from '../pages/AgenciaDetalle.jsx';
import Agencias from '../pages/Agencias.jsx';
import Destinos from '../pages/Destinos.jsx';
import DeveloperView from '../pages/DeveloperView.jsx';
import EncomiendaBuscar from '../pages/EncomiendaBuscar.jsx';
import EncomiendaDetalle from '../pages/EncomiendaDetalle.jsx';
import EncomiendaEditar from '../pages/EncomiendaEditar.jsx';
import EncomiendaNueva from '../pages/EncomiendaNueva.jsx';
import Encomiendas from '../pages/Encomiendas.jsx';
import NotFound from '../pages/NotFound.jsx';
import OptimizacionCarga from '../pages/OptimizacionCarga.jsx';
import ReniecConsulta from '../pages/ReniecConsulta.jsx';
import SecretariaDashboard from '../pages/SecretariaDashboard.jsx';
import SunatBoletas from '../pages/SunatBoletas.jsx';
import Tracking from '../pages/Tracking.jsx';
import CotizarPublicPage from '../pages/public/CotizarPublicPage.jsx';
import HomePublicPage from '../pages/public/HomePublicPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegistrarEnvioPage from '../pages/public/RegistrarEnvioPage.jsx';
import ReclamosPublicPage from '../pages/public/ReclamosPublicPage.jsx';
import RegistroExitosoPage from '../pages/public/RegistroExitosoPage.jsx';
import ReclamoDetalle from '../pages/ReclamoDetalle.jsx';
import Reclamos from '../pages/Reclamos.jsx';
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

function RoleEntryRedirect() {
  const { user } = useAuth();
  return <Navigate to={getRoleHomePath(user)} replace />;
}

function MyAgencyRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.agency_id ? `/admin/agencias/${user.agency_id}` : getRoleHomePath(user)} replace />;
}

function SecretaryClaimsPage({ detail = false }) {
  const { user } = useAuth();
  if (!user?.agency_id) return <Navigate to="/login" replace />;
  return detail
    ? <ReclamoDetalle agencyIdOverride={user.agency_id} />
    : <Reclamos agencyId={user.agency_id} agencyName="Mi agencia" caseBasePath="/secretaria/reclamos" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/secretaria"
        element={
          <ProtectedRoute roles={['SECRETARIA']} strict>
            <SecretariaDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/secretaria/reclamos" element={<ProtectedRoute roles={['SECRETARIA']} strict><SecretaryClaimsPage /></ProtectedRoute>} />
      <Route path="/secretaria/reclamos/:claimId" element={<ProtectedRoute roles={['SECRETARIA']} strict><SecretaryClaimsPage detail /></ProtectedRoute>} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePublicPage />} />
        <Route path="/registrar-envio" element={<RegistrarEnvioPage />} />
        <Route path="/reclamos" element={<ReclamosPublicPage />} />
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
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleEntryRedirect />} />

        <Route
          element={
            <ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN', 'DEVELOPER']} strict>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={<LegacyRedirect to="/admin/agencias" />}
          />
          <Route path="agencias/mia" element={<ProtectedRoute roles={['AGENCY_ADMIN']} strict><MyAgencyRedirect /></ProtectedRoute>} />
          <Route path="agencias" element={<ProtectedRoute roles={['ADMIN_GENERAL']} strict><Agencias /></ProtectedRoute>} />
          <Route path="agencias/:agencyId" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><AgenciaDetalle /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/:section" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><AgenciaDetalle /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/encomiendas/nueva" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><EncomiendaNueva /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/encomiendas/buscar" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><EncomiendaBuscar /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/encomiendas/:id" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><EncomiendaDetalle /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/encomiendas/:id/editar" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN']} strict><AgencyRouteGuard><EncomiendaEditar /></AgencyRouteGuard></ProtectedRoute>} />
          <Route path="agencias/:agencyId/reclamos/:claimId" element={<ProtectedRoute roles={['ADMIN_GENERAL', 'AGENCY_ADMIN', 'SECRETARIA']} strict><AgencyRouteGuard><ReclamoDetalle /></AgencyRouteGuard></ProtectedRoute>} />
          <Route
            path="developer"
            element={
            <ProtectedRoute roles={['DEVELOPER']} strict>
                <DeveloperView />
              </ProtectedRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="encomiendas"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <Encomiendas />
              </ProtectedRoute>
            }
          />
          <Route
            path="destinos"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <Destinos />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios"
            element={<LegacyRedirect to="/admin/agencias" />}
          />
          <Route
            path="encomiendas/nueva"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <EncomiendaNueva />
              </ProtectedRoute>
            }
          />
          <Route
            path="encomiendas/buscar"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <EncomiendaBuscar />
              </ProtectedRoute>
            }
          />
          <Route
            path="encomiendas/:id/editar"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <EncomiendaEditar />
              </ProtectedRoute>
            }
          />
          <Route
            path="encomiendas/:id"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <EncomiendaDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="tracking"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <Tracking />
              </ProtectedRoute>
            }
          />
          <Route path="sunat" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
          <Route
            path="sunat/boletas"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <SunatBoletas />
              </ProtectedRoute>
            }
          />
          <Route
            path="reniec"
            element={
              <ProtectedRoute roles={['ADMIN_GENERAL']} strict>
                <ReniecConsulta />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['ESTIBA']} anyOf={['optimization.read']} strict>
              <StowageLayout />
            </ProtectedRoute>
          }
        >
          <Route path="optimizacion-carga" element={<OptimizacionCarga />} />
        </Route>

        <Route path="*" element={<RoleEntryRedirect />} />
      </Route>

      <Route path="/clientes" element={<LegacyRedirect to="/admin/clientes" />} />
      <Route path="/usuarios" element={<LegacyRedirect to="/admin/usuarios" />} />
      <Route path="/encomiendas" element={<LegacyRedirect to="/admin/encomiendas" />} />
      <Route path="/destinos" element={<LegacyRedirect to="/admin/destinos" />} />
      <Route path="/encomiendas/nueva" element={<LegacyRedirect to="/admin/encomiendas/nueva" />} />
      <Route path="/encomiendas/buscar" element={<LegacyRedirect to="/admin/encomiendas/buscar" />} />
      <Route path="/encomiendas/:id/editar" element={<LegacyEncomiendaRedirect suffix="/editar" />} />
      <Route path="/encomiendas/:id" element={<LegacyEncomiendaRedirect />} />
      <Route path="/sunat-boletas" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/sunat" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/sunat/boletas" element={<LegacyRedirect to="/admin/sunat/boletas" />} />
      <Route path="/reniec" element={<LegacyRedirect to="/admin/reniec" />} />
      <Route path="/optimizacion-carga" element={<LegacyRedirect to="/admin/optimizacion-carga" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
