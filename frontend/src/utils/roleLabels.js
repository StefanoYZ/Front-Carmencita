const ROLE_LABELS = {
  ADMIN_GENERAL: 'Administrador general',
  AGENCY_ADMIN: 'Administrador de agencia',
  SECRETARIA: 'Secretaría',
  ESTIBA: 'Personal de estiba',
  DEVELOPER: 'Acceso técnico',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function userRoleLabels(user) {
  return (user?.roles || []).map(roleLabel).join(', ') || 'Sin rol';
}
