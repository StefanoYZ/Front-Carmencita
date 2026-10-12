import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar.jsx';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      full_name: 'Administrador de agencia',
      username: 'agency_admin',
      roles: ['AGENCY_ADMIN'],
      agency_id: 7,
    },
  }),
}));

describe('iconos de navegación del sidebar', () => {
  it('muestra un icono distinto para cada sección de agencia', () => {
    render(
      <MemoryRouter initialEntries={['/admin/agencias/7']}>
        <Sidebar
          collapsed={false}
          mobileOpen
          onExpand={() => {}}
          onCollapse={() => {}}
          onCloseMobile={() => {}}
        />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Navegación de agencia' });
    const icons = Array.from(navigation.querySelectorAll('a svg')).map((icon) => (
      Array.from(icon.classList).find((className) => className.startsWith('lucide-'))
    ));

    expect(icons).toHaveLength(5);
    expect(new Set(icons).size).toBe(5);
  });
});
