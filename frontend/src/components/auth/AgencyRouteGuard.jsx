import { Navigate, useParams } from 'react-router-dom';
import { getRoleHomePath, hasRole } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';

function AgencyRouteGuard({ children }) {
  const { agencyId } = useParams();
  const { user } = useAuth();
  const isAgencyAdmin = hasRole(user, ['AGENCY_ADMIN']);

  if (isAgencyAdmin && Number(agencyId) !== Number(user?.agency_id)) {
    return <Navigate to={getRoleHomePath(user)} replace />;
  }

  return children;
}

export default AgencyRouteGuard;
