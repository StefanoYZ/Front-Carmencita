import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reclamos from './Reclamos.jsx';

const api = vi.hoisted(() => ({
  listClaims: vi.fn().mockResolvedValue([]),
  getClaimPrivacyNotice: vi.fn().mockResolvedValue({ text: 'Aviso interno' }),
  getInPersonClaimSender: vi.fn(),
  createInPersonClaim: vi.fn(),
}));

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => ({ user: { roles: ['ADMIN_GENERAL'], agency_id: null } }) }));
vi.mock('../services/reclamosService.js', () => api);

describe('bandeja de reclamos dentro de una agencia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta solo los casos de la agencia seleccionada y no muestra selector global', async () => {
    api.listClaims.mockResolvedValue([{ id: 4, case_code: 'RC-AB123', shipment_id: 9, claimant_name: 'Cliente', category: 'DANO', source: 'WEB', status: 'RECIBIDO' }]);
    render(<MemoryRouter><Reclamos agencyId="7" agencyName="Agencia Trujillo" /></MemoryRouter>);
    await screen.findByText('RC-AB123');
    await waitFor(() => expect(api.listClaims).toHaveBeenCalledWith({ agencyId: '7', status: '' }));
    expect(screen.getByText(/solo se muestran casos asignados a Agencia Trujillo/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/agencia que atenderá/i)).not.toBeInTheDocument();
  });

  it('autocompleta el documento del remitente al consultar el código en la agencia activa', async () => {
    const user = userEvent.setup();
    api.listClaims.mockResolvedValue([]);
    api.getInPersonClaimSender.mockResolvedValue({
      shipment_code: 'J000000001',
      sender_document_type: 'DNI',
      sender_document_number: '70123456',
    });
    api.createInPersonClaim.mockResolvedValue({ case_code: 'RC-NEW123' });
    render(<MemoryRouter><Reclamos agencyId="7" agencyName="Agencia Trujillo" /></MemoryRouter>);

    await user.click(await screen.findByRole('button', { name: /registrar presencialmente/i }));
    await screen.findByText('Aviso interno');
    const shipmentCode = document.querySelector('input[name="shipment_code"]');
    await user.type(shipmentCode, 'J000000001');

    await waitFor(() => expect(api.getInPersonClaimSender).toHaveBeenCalledWith('7', 'J000000001'));
    await waitFor(() => expect(document.querySelector('input[name="claimant_document_number"]')).toHaveValue('70123456'));
    expect(shipmentCode).toHaveFocus();

    await user.type(document.querySelector('textarea'), 'El cliente reporta un daño en el paquete.');
    await user.click(document.querySelector('input[type="checkbox"]'));
    await user.click(screen.getByRole('button', { name: 'Registrar caso' }));

    await waitFor(() => expect(api.createInPersonClaim).toHaveBeenCalledWith(expect.objectContaining({
      shipment_code: 'J000000001',
      claimant_document_number: '70123456',
      agency_id: 7,
      category: 'DANO',
      description: 'El cliente reporta un daño en el paquete.',
      privacy_notice_acknowledged: true,
    })));
  });

  it('muestra el error de un código no encontrado y no deja el documento anterior', async () => {
    const user = userEvent.setup();
    api.listClaims.mockResolvedValue([]);
    api.getInPersonClaimSender.mockImplementation(async (_agencyId, shipmentCode) => {
      if (shipmentCode === 'J000000001') {
        return { shipment_code: shipmentCode, sender_document_type: 'DNI', sender_document_number: '70123456' };
      }
      throw {
        response: {
          status: 404,
          data: { detail: 'Encomienda no encontrada' },
        },
      };
    });
    render(<MemoryRouter><Reclamos agencyId="7" agencyName="Agencia Trujillo" /></MemoryRouter>);

    await user.click(await screen.findByRole('button', { name: /registrar presencialmente/i }));
    const shipmentCode = document.querySelector('input[name="shipment_code"]');
    const claimantDocument = document.querySelector('input[name="claimant_document_number"]');
    await user.type(shipmentCode, 'J000000001');
    await waitFor(() => expect(claimantDocument).toHaveValue('70123456'));

    await user.clear(shipmentCode);
    await user.type(shipmentCode, 'L000001993');
    await waitFor(() => expect(api.getInPersonClaimSender).toHaveBeenCalledWith('7', 'L000001993'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Encomienda no encontrada');
    expect(claimantDocument).toHaveValue('');
  });
});
