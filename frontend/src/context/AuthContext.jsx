import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../auth/accessControl.js';
import {
  clearAuthSession,
  clearLegacyAuthSession,
  getStoredAuthToken,
  getStoredAuthUser,
  saveAuthSession,
} from '../auth/session.js';
import { login as loginRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => {
    clearLegacyAuthSession();
    return getStoredAuthToken();
  });
  const [user, setUser] = useState(() => getStoredAuthUser());

  const isAuthenticated = Boolean(token && user);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    setToken(data.access_token);
    setUser(data.user);
    saveAuthSession(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      logout();
      navigate('/login', {
        replace: true,
        state: { sessionMessage: 'La sesión venció. Ingresa nuevamente.' },
      });
    };

    window.addEventListener('carmencita:auth-expired', handleExpiredSession);
    return () => window.removeEventListener('carmencita:auth-expired', handleExpiredSession);
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated || location.pathname.startsWith('/admin') || location.pathname === '/login') {
      return;
    }
    logout();
  }, [isAuthenticated, location.pathname, logout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      roleHomePath: user ? getRoleHomePath(user) : '/admin',
      token,
      user,
    }),
    [isAuthenticated, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
