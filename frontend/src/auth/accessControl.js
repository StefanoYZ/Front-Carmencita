export const adminNavigationItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    anyOf: [],
    roles: ['ADMINISTRADOR', 'SECRETARIA'],
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
    label: 'Destinos',
    path: '/admin/destinos',
    anyOf: ['encomiendas.write'],
    roles: ['ADMINISTRADOR', 'SECRETARIA'],
  },
  {
    label: 'Usuarios internos',
    path: '/admin/usuarios',
    anyOf: ['users.read'],
    roles: ['ADMINISTRADOR'],
  },
  {
    label: 'Vista Developer',
    path: '/admin/developer',
    anyOf: ['developer.read'],
    roles: ['ADMINISTRADOR', 'DEVELOPER'],
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
  if (hasRole(user, ['ESTIBA']) && hasAnyPermission(user, ['optimization.read'])) {
    return '/admin/optimizacion-carga';
  }
  if (hasRole(user, ['DEVELOPER']) && !hasRole(user, ['ADMINISTRADOR', 'SECRETARIA'])) {
    return '/admin/developer';
  }
  if (hasRole(user, ['SECRETARIA']) && canAccess(user, { anyOf: ['encomiendas.write'] })) {
    return '/secretaria';
  }
  if (hasRole(user, ['ADMINISTRADOR'])) return '/admin/dashboard';
  return getAllowedNavigation(user)[0]?.path || '/login';
}
