import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../auth/accessControl.js';
import {
  clearAuthSession,
  clearLegacyAuthSession,
  getAuthLastActivity,
  getStoredAuthToken,
  getStoredAuthUser,
  saveAuthSession,
  touchAuthSession,
} from '../auth/session.js';
import { login as loginRequest } from '../services/authService.js';

const AuthContext = createContext(null);
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pointerActivityRef = useRef({ x: null, y: null, timestamp: 0 });
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

  useEffect(() => {
    if (!isAuthenticated || !location.pathname.startsWith('/admin')) {
      return undefined;
    }

    let timeoutId;

    const expireSession = () => {
      logout();
      navigate('/login', {
        replace: true,
        state: {
          sessionMessage: 'La sesión fue bloqueada por inactividad. Ingresa nuevamente.',
        },
      });
    };

    const scheduleExpiration = (renewActivity = true) => {
      if (renewActivity) {
        touchAuthSession();
      }
      window.clearTimeout(timeoutId);
      const lastActivity = getAuthLastActivity() || Date.now();
      const remaining = Math.max(INACTIVITY_LIMIT_MS - (Date.now() - lastActivity), 0);
      if (remaining === 0) {
        expireSession();
        return;
      }
      timeoutId = window.setTimeout(expireSession, remaining);
    };

    const handleActivity = () => scheduleExpiration(true);
    const handlePointerMove = (event) => {
      const previous = pointerActivityRef.current;
      const distance = previous.x === null
        ? Number.POSITIVE_INFINITY
        : Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
      const elapsed = Date.now() - previous.timestamp;
      if (distance < 18 || elapsed < 1000) return;
      pointerActivityRef.current = {
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      };
      scheduleExpiration(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        scheduleExpiration(false);
      }
    };

    const activityEvents = ['keydown', 'click', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    scheduleExpiration(false);

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthenticated, location.pathname, logout, navigate]);

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
