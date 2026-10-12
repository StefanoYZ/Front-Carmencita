import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AgencyUsers, { availableAgencyRoles } from './AgencyUsers.jsx';

const api = vi.hoisted(() => ({
  getAgencyUsers: vi.fn().mockResolvedValue([]),
  createAgencyUser: vi.fn().mockResolvedValue({ id: 5 }),
  assignAgencyAdmin: vi.fn().mockResolvedValue({ id: 12 }),
  setAgencyUserActive: vi.fn(),
}));
vi.mock('../services/agenciasService.js', () => api);

const agency = { id: 12, destination: { name: 'Trujillo' }, admin: null };

describe('roles que se pueden crear en una agencia', () => {
  it('reserva el administrador de agencia al administrador general', () => {
    expect(availableAgencyRoles(true)).toEqual(['AGENCY_ADMIN', 'SECRETARIA', 'ESTIBA']);
    expect(availableAgencyRoles(false)).toEqual(['SECRETARIA', 'ESTIBA']);
  });

  it('muestra un único formulario con solo los roles autorizados para el administrador de agencia', async () => {
    render(<AgencyUsers agency={agency} isGlobalAdmin={false} onAgencyChange={vi.fn()} />);
    await screen.findByText('Aún no hay usuarios en esta agencia.');
    expect(screen.getAllByRole('button', { name: 'Crear usuario' })).toHaveLength(1);
    const choices = Array.from(screen.getByRole('combobox').options).map((option) => option.value);
    expect(choices).toEqual(['SECRETARIA', 'ESTIBA']);
  });

  it('crea al administrador desde el mismo formulario y lo vincula a la agencia', async () => {
    const onAgencyChange = vi.fn();
    render(<AgencyUsers agency={agency} isGlobalAdmin onAgencyChange={onAgencyChange} />);
    await screen.findByText('Aún no hay usuarios en esta agencia.');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AGENCY_ADMIN' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Nombre completo/ }), { target: { value: 'Mario Pérez' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Usuario/ }), { target: { value: 'mario' } });
    fireEvent.change(screen.getByLabelText('Contraseña', { exact: true }), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
    await waitFor(() => expect(api.assignAgencyAdmin).toHaveBeenCalledWith(12, {
      username: 'mario', full_name: 'Mario Pérez', password: 'pass1234',
    }));
    expect(api.createAgencyUser).not.toHaveBeenCalled();
    expect(onAgencyChange).toHaveBeenCalled();
  });
});
