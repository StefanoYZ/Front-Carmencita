import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistrarEnvioPage from './RegistrarEnvioPage.jsx';

const apiMock = vi.hoisted(() => ({
  get: vi.fn().mockResolvedValue({ data: {
    version: '2026-10-11',
    text: 'CARMENCITA EXPRESS CARGO S.A.C. tratará los datos para gestionar y entregar el envío.',
  } }),
  post: vi.fn(),
  clientLookup: vi.fn(),
  reniecLookup: vi.fn().mockResolvedValue({ nombre_completo: 'Mario Perez' }),
}));

vi.mock('../../services/apiClient.js', () => ({
  default: apiMock,
  getApiErrorMessage: (_error, fallback) => fallback,
}));
vi.mock('../../services/destinosService.js', () => ({ getDestinos: vi.fn().mockResolvedValue([]) }));
vi.mock('../../services/clientes.service.js', () => ({ getClienteByDni: apiMock.clientLookup }));
vi.mock('../../services/encomiendasService.js', () => ({ crearPreRegistro: vi.fn(), crearEncomienda: vi.fn() }));
vi.mock('../../services/reniecService.js', () => ({ consultarDni: apiMock.reniecLookup }));
vi.mock('../../components/public/StepIndicator.jsx', () => ({ default: () => <div>Pasos del registro</div> }));
vi.mock('../../components/public/ShipmentFormStep.jsx', () => ({
  default: ({ onSubmit, form, onChange, onReniecLookup }) => (
    <form onSubmit={onSubmit}>
      <input aria-label="Datos del remitente" name="remitente_numero_documento" value={form.remitente_numero_documento} onChange={onChange} onBlur={() => onReniecLookup('remitente')} />
      <button type="submit">Continuar al pago</button>
    </form>
  ),
}));
vi.mock('../../components/public/PaymentConfirmationStep.jsx', () => ({ default: () => <div>Confirmación de pago</div> }));

describe('aviso de privacidad del registro público', () => {
  beforeEach(() => {
    apiMock.get.mockClear();
    apiMock.clientLookup.mockClear();
    apiMock.reniecLookup.mockClear();
    apiMock.get.mockResolvedValue({ data: {
      version: '2026-10-11',
      text: 'CARMENCITA EXPRESS CARGO S.A.C. tratará los datos para gestionar y entregar el envío.',
    } });
  });

  it('se muestra como modal al intentar ingresar datos, no al entrar a la página', async () => {
    render(<MemoryRouter><RegistrarEnvioPage /></MemoryRouter>);
    await screen.findByText('Pasos del registro');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole('textbox', { name: 'Datos del remitente' }));

    expect(await screen.findByRole('dialog', { name: 'Uso de datos personales' })).toBeInTheDocument();
    expect(screen.getByText(/CARMENCITA EXPRESS CARGO S\.A\.C\. tratará los datos/)).toBeInTheDocument();
  });

  it('solicita confirmación de lectura y reabre el aviso si se pospone', async () => {
    render(<MemoryRouter><RegistrarEnvioPage /></MemoryRouter>);
    await screen.findByText('Pasos del registro');
    fireEvent.focus(screen.getByRole('textbox', { name: 'Datos del remitente' }));
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.focus(screen.getByRole('textbox', { name: 'Datos del remitente' }));
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'He leído y continuar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByRole('status')).toHaveTextContent('Aviso leído. Ya puedes completar los datos de tu envío.');
  });

  it('consulta RENIEC sin consultar la ficha privada local por DNI', async () => {
    render(<MemoryRouter><RegistrarEnvioPage /></MemoryRouter>);
    await screen.findByText('Pasos del registro');
    const dni = screen.getByRole('textbox', { name: 'Datos del remitente' });
    fireEvent.focus(dni);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'He leído y continuar' }));
    fireEvent.change(dni, { target: { value: '12345678' } });
    fireEvent.blur(dni);
    await waitFor(() => expect(apiMock.reniecLookup).toHaveBeenCalledWith('12345678'));
    expect(apiMock.clientLookup).not.toHaveBeenCalled();
  });
});
