import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccess, getRoleHomePath } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';

function ProtectedRoute({ children, anyOf = [], roles = [] }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(user, { anyOf, roles })) {
    return <Navigate to={getRoleHomePath(user)} replace />;
  }

  return children;
}

export default ProtectedRoute;
