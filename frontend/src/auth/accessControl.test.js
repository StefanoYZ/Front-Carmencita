import { describe, expect, it } from 'vitest';
import {
  getAllowedNavigation,
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

  it('permite al administrador modulos administrativos', () => {
    const user = { roles: ['ADMINISTRADOR'], permissions: [] };
    expect(getRoleHomePath(user)).toBe('/admin/dashboard');
    expect(hasAnyPermission(user, ['users.read'])).toBe(true);
    expect(getAllowedNavigation(user).some((item) => item.path === '/admin/usuarios')).toBe(true);
  });
});
