export const adminNavigationItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    anyOf: [],
  },
  {
    label: 'Clientes',
    path: '/admin/clientes',
    anyOf: ['encomiendas.write', 'users.read'],
    roles: ['ADMINISTRADOR', 'SECRETARIA'],
  },
  {
    label: 'Encomiendas',
    path: '/admin/encomiendas',
    anyOf: ['encomiendas.read'],
  },
  {
    label: 'Nueva encomienda',
    path: '/admin/encomiendas/nueva',
    anyOf: ['encomiendas.write'],
  },
  {
    label: 'Cotizaciones',
    path: '/admin/cotizaciones',
    anyOf: ['cotizaciones.read', 'cotizaciones.calculate'],
  },
  {
    label: 'Tracking interno',
    path: '/admin/tracking',
    anyOf: ['tracking.read'],
  },
  {
    label: 'SUNAT / Boletas',
    path: '/admin/sunat/boletas',
    anyOf: ['sunat.read', 'sunat.emit', 'sunat.download_pdf'],
  },
  {
    label: 'RENIEC',
    path: '/admin/reniec',
    anyOf: ['encomiendas.write'],
    roles: ['ADMINISTRADOR', 'SECRETARIA'],
  },
  {
    label: 'Payments',
    path: '/admin/payments',
    anyOf: [],
    roles: ['ADMINISTRADOR'],
  },
  {
    label: 'Yape',
    path: '/admin/yape',
    anyOf: [],
    roles: ['ADMINISTRADOR'],
  },
  {
    label: 'Optimizacion de carga',
    path: '/admin/optimizacion-carga',
    anyOf: ['tracking.update_status', 'encomiendas.read'],
    roles: ['ADMINISTRADOR', 'ESTIBA'],
  },
];

export function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

export function getUserRoles(user) {
  return Array.isArray(user?.roles) ? user.roles.map(normalizeRole).filter(Boolean) : [];
}

export function getUserPermissions(user) {
  return Array.isArray(user?.permissions)
    ? user.permissions.map((permission) => String(permission || '').trim()).filter(Boolean)
    : [];
}

export function hasRole(user, roles = []) {
  const requiredRoles = roles.map(normalizeRole).filter(Boolean);
  if (requiredRoles.length === 0) return false;
  const currentRoles = getUserRoles(user);
  return requiredRoles.some((role) => currentRoles.includes(role));
}

export function hasAnyPermission(user, permissions = []) {
  const requiredPermissions = permissions.filter(Boolean);
  if (requiredPermissions.length === 0) return true;
  if (hasRole(user, ['ADMINISTRADOR'])) return true;
  const currentPermissions = getUserPermissions(user);
  return requiredPermissions.some((permission) => currentPermissions.includes(permission));
}

export function canAccess(user, { anyOf = [], roles = [] } = {}) {
  if (!user) return false;
  if (roles.length > 0 && hasRole(user, roles)) return true;
  if (roles.length > 0 && anyOf.length === 0) return false;
  return hasAnyPermission(user, anyOf);
}

export function getAllowedNavigation(user) {
  return adminNavigationItems.filter((item) => canAccess(user, item));
}

export function getRoleHomePath(user) {
  if (hasRole(user, ['ADMINISTRADOR'])) return '/admin';
  if (hasRole(user, ['SECRETARIA']) && canAccess(user, { anyOf: ['encomiendas.write'] })) {
    return '/admin/encomiendas/nueva';
  }
  if (hasRole(user, ['ESTIBA']) && canAccess(user, { anyOf: ['tracking.read'] })) {
    return '/admin/tracking';
  }
  return getAllowedNavigation(user)[0]?.path || '/admin';
}
