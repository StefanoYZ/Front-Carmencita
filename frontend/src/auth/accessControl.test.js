import { describe, expect, it } from 'vitest';
import {
  getAllowedNavigation,
  getAgencyNavigation,
  getRoleHomePath,
  hasAnyPermission,
} from './accessControl.js';

describe('accessControl', () => {
  it('redirige al estibador exclusivamente a optimizacion', () => {
    const user = {
      roles: ['ESTIBA'],
      permissions: ['optimization.read', 'optimization.run'],
    };
    expect(getRoleHomePath(user)).toBe('/admin/optimizacion-carga');
    expect(getAllowedNavigation(user)).toEqual([]);
  });

  it('permite al administrador general modulos administrativos', () => {
    const user = { roles: ['ADMIN_GENERAL'], permissions: [] };
    expect(getRoleHomePath(user)).toBe('/admin/agencias');
    expect(hasAnyPermission(user, ['users.read'])).toBe(true);
    expect(getAllowedNavigation(user).some((item) => item.path === '/admin/usuarios')).toBe(false);
    expect(getAllowedNavigation(user).some((item) => item.path === '/admin/reclamos')).toBe(false);
  });

  it('redirige al administrador de agencia a su URL contextual', () => {
    const user = { agency_id: 12, roles: ['AGENCY_ADMIN', 'SECRETARIA'], permissions: ['agencias.read', 'encomiendas.write'] };
    expect(getRoleHomePath(user)).toBe('/admin/agencias/12');
    expect(getAllowedNavigation(user)).toEqual([
      expect.objectContaining({ label: 'Mi agencia', path: '/admin/agencias/mia' }),
    ]);
  });

  it('solo ofrece módulos de la agencia autorizada y retorno global separado', () => {
    const staffAdmin = { agency_id: 12, roles: ['AGENCY_ADMIN'] };
    expect(getAgencyNavigation(staffAdmin, 13)).toEqual([]);
    expect(getAgencyNavigation(staffAdmin, 12).map((item) => item.label)).toEqual([
      'Dashboard', 'Encomiendas', 'Clientes', 'Reclamos', 'Usuarios internos',
    ]);
    expect(getAgencyNavigation({ roles: ['ADMIN_GENERAL'] }, 13)[0].path).toBe('/admin/agencias/13');
  });
});
