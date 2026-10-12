import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReclamosPublicPage from './ReclamosPublicPage.jsx';

const api = vi.hoisted(() => ({
  createPublicClaim: vi.fn(),
  getClaimPrivacyNotice: vi.fn(),
  getPublicClaimAgencies: vi.fn(),
  getPublicClaimSender: vi.fn(),
  lookupPublicClaim: vi.fn(),
  uploadPublicClaimEvidence: vi.fn(),
}));

vi.mock('../../services/reclamosService.js', () => api);

describe('flujo público de reclamos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getClaimPrivacyNotice.mockResolvedValue({ version: '2026-10-11', text: 'Aviso de privacidad.' });
    api.getPublicClaimAgencies.mockResolvedValue([{ id: 7, place: 'Agencia Trujillo', address: 'Av. Principal', phone: '044123456' }]);
    api.getPublicClaimSender.mockResolvedValue({
      shipment_code: 'J000000001',
      sender_document_type: 'DNI',
      sender_document_number: '70123456',
    });
    api.createPublicClaim.mockResolvedValue({ case_code: 'RC-2026-AB123', status: 'RECIBIDO' });
    api.uploadPublicClaimEvidence.mockResolvedValue({ id: 18 });
    api.lookupPublicClaim.mockResolvedValue({
      case_code: 'RC-2026-AB123',
      status: 'RECIBIDO',
      events: [{ id: 1, note: 'Recibimos tu reclamo.', created_at: '2026-10-12T10:00:00Z', actor_name: 'Personal interno' }],
      shipment_events: [{ id: 2, evento: 'REGISTRADA', estado: 'REGISTRADA', detalle: 'Encomienda registrada.', fecha: '2026-10-12T09:00:00Z', actor_name: 'Personal interno' }],
    });
  });

  it('completa el reclamo, adjunta evidencia y consulta el caso sin exponer actores internos', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reclamos?codigo=J000000001']}>
        <ReclamosPublicPage />
      </MemoryRouter>,
    );

    await screen.findByText('Agencia Trujillo');
    expect(document.querySelector('input[name="shipment_code"]')).toHaveValue('J000000001');
    await waitFor(() => expect(api.getPublicClaimSender).toHaveBeenCalledWith('J000000001'));
    await waitFor(() => expect(document.querySelector('input[name="document_number"]')).toHaveValue('70123456'));
    expect(document.querySelector('input[name="document_number"]')).not.toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Motivo'), 'DANO');
    await user.type(document.querySelector('input[name="contact_phone"]'), '987654321');
    await user.type(document.querySelector('input[name="contact_email"]'), 'cliente@example.test');
    await user.type(document.querySelector('textarea[name="description"]'), 'El paquete llegó con la caja dañada.');
    await user.upload(
      document.querySelector('input[type="file"]'),
      new File(['evidencia'], 'paquete.png', { type: 'image/png' }),
    );
    await user.click(document.querySelector('input[type="checkbox"]'));
    await user.click(screen.getByRole('button', { name: 'Enviar reclamo' }));

    await screen.findByText('RC-2026-AB123');
    expect(api.createPublicClaim).toHaveBeenCalledWith({
      shipment_code: 'J000000001',
      document_number: '70123456',
      agency_id: 7,
      category: 'DANO',
      description: 'El paquete llegó con la caja dañada.',
      contact_phone: '987654321',
      contact_email: 'cliente@example.test',
      privacy_notice_accepted: true,
      privacy_notice_version: '2026-10-11',
    });
    expect(api.uploadPublicClaimEvidence).toHaveBeenCalledWith(
      'RC-2026-AB123',
      expect.objectContaining({ name: 'paquete.png', type: 'image/png' }),
      'J000000001',
      '70123456',
    );

    await user.click(screen.getByRole('tab', { name: 'Consultar un caso' }));
    const lookupFields = screen.getAllByRole('textbox');
    expect(lookupFields[0]).toHaveValue('RC-2026-AB123');
    expect(lookupFields[1]).toHaveValue('J000000001');
    expect(lookupFields[2]).toHaveValue('70123456');
    await user.click(screen.getByRole('button', { name: 'Consultar caso' }));
    await waitFor(() => expect(api.lookupPublicClaim).toHaveBeenCalledWith({
      case_code: 'RC-2026-AB123',
      shipment_code: 'J000000001',
      document_number: '70123456',
    }));
    expect(await screen.findByText('Encomienda registrada.')).toBeInTheDocument();
    expect(screen.queryByText('Personal interno')).not.toBeInTheDocument();
  });

  it('autocompleta el DNI al escribir el código sin salir del campo', async () => {
    const user = userEvent.setup();
    api.getPublicClaimSender.mockResolvedValue({
      shipment_code: 'L000001993',
      sender_document_type: 'DNI',
      sender_document_number: '71234567',
    });
    render(<MemoryRouter><ReclamosPublicPage /></MemoryRouter>);

    await screen.findByText('Agencia Trujillo');
    const shipmentCode = document.querySelector('input[name="shipment_code"]');
    await user.type(shipmentCode, 'L000001993');
    await waitFor(() => expect(api.getPublicClaimSender).toHaveBeenCalledWith('L000001993'));
    await waitFor(() => expect(document.querySelector('input[name="document_number"]')).toHaveValue('71234567'));
    expect(shipmentCode).toHaveFocus();
  });
});
