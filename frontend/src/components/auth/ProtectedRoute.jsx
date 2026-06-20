import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  canAccess,
  getRoleHomePath,
  hasAnyPermission,
  hasRole,
} from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';

function ProtectedRoute({ children, anyOf = [], roles = [], strict = false }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasStrictAccess = (
    (roles.length === 0 || hasRole(user, roles))
    && (anyOf.length === 0 || hasAnyPermission(user, anyOf))
  );

  if (strict ? !hasStrictAccess : !canAccess(user, { anyOf, roles })) {
    return <Navigate to={getRoleHomePath(user)} replace />;
  }

  return children;
}

export default ProtectedRoute;
