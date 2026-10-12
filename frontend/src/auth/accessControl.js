export const adminNavigationItems = [
  {
    label: 'Agencias',
    path: '/admin/agencias',
    anyOf: [],
    roles: ['ADMIN_GENERAL'],
  },
  {
    label: 'Mi agencia',
    path: '/admin/agencias/mia',
    anyOf: [],
    roles: ['AGENCY_ADMIN'],
  },
  {
    label: 'Clientes',
    path: '/admin/clientes',
    anyOf: [],
    roles: ['ADMIN_GENERAL'],
  },
  {
    label: 'Lugares',
    path: '/admin/destinos',
    anyOf: [],
    roles: ['ADMIN_GENERAL'],
  },
  {
    label: 'Vista Developer',
    path: '/admin/developer',
    anyOf: [],
    roles: ['DEVELOPER'],
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
  if (hasRole(user, ['ADMIN_GENERAL'])) return true;
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

export function getAgencyNavigation(user, agencyId) {
  if (!agencyId || !hasRole(user, ['ADMIN_GENERAL', 'AGENCY_ADMIN'])) return [];
  if (hasRole(user, ['AGENCY_ADMIN']) && Number(user.agency_id) !== Number(agencyId)) return [];
  const root = `/admin/agencias/${agencyId}`;
  return [
    { label: 'Dashboard', path: root },
    { label: 'Encomiendas', path: `${root}/encomiendas` },
    { label: 'Clientes', path: `${root}/clientes` },
    { label: 'Reclamos', path: `${root}/reclamos` },
    { label: 'Usuarios internos', path: `${root}/usuarios` },
  ];
}

export function getRoleHomePath(user) {
  if (hasRole(user, ['ADMIN_GENERAL'])) return '/admin/agencias';
  if (hasRole(user, ['AGENCY_ADMIN'])) {
    return user?.agency_id ? `/admin/agencias/${user.agency_id}` : '/login';
  }
  if (hasRole(user, ['ESTIBA']) && hasAnyPermission(user, ['optimization.read'])) {
    return '/admin/optimizacion-carga';
  }
  if (hasRole(user, ['DEVELOPER']) && !hasRole(user, ['ADMIN_GENERAL', 'SECRETARIA', 'AGENCY_ADMIN'])) {
    return '/admin/developer';
  }
  if (hasRole(user, ['SECRETARIA']) && canAccess(user, { anyOf: ['encomiendas.write'] })) {
    return '/secretaria';
  }
  return getAllowedNavigation(user)[0]?.path || '/login';
}
