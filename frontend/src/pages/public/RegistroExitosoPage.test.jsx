import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistroExitosoPage from './RegistroExitosoPage.jsx';
import { confirmarPreRegistro, getEtiquetaPdf } from '../../services/encomiendasService.js';
import { generarPdfBetaDesdeEncomienda } from '../../services/sunatService.js';

vi.mock('../../services/encomiendasService.js', () => ({
  getEtiquetaPdf: vi.fn(),
  confirmarPreRegistro: vi.fn(),
}));

vi.mock('../../services/sunatService.js', () => ({
  generarPdfBetaDesdeEncomienda: vi.fn(),
}));

vi.mock('../../services/measurementLogsService.js', () => ({
  iniciarLogBoleta: vi.fn().mockResolvedValue({ id: 1 }),
  finalizarLogBoleta: vi.fn().mockResolvedValue({}),
}));

// PackageBaseSelector usa canvas/WebGL (no disponible en jsdom); se reemplaza por
// un stub para poder probar el flujo de pago.
vi.mock('../../components/common/PackageBaseSelector.jsx', () => ({
  default: ({ value }) => <div data-testid="base-selector">base:{value || 'sin-seleccionar'}</div>,
}));

describe('RegistroExitosoPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra impresion para una encomienda formal', async () => {
    const replace = vi.fn();
    const close = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: vi.fn() },
      location: { replace },
      close,
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-label');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    getEtiquetaPdf.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/registro-exitoso',
          state: {
            result: {
              id: 10,
              codigo_encomienda: 'J000000010',
              estado: 'REGISTRADA',
            },
            payment: { method: 'card', status: 'approved' },
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /imprimir etiqueta con qr/i }));
    await waitFor(() => expect(getEtiquetaPdf).toHaveBeenCalledWith(10));
    expect(replace).toHaveBeenCalledWith('blob:test-label');
    expect(close).not.toHaveBeenCalled();
  });

  it('permite imprimir la boleta Lycet para una encomienda formal', async () => {
    const replace = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: vi.fn() },
      location: { replace },
      close: vi.fn(),
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-receipt');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    generarPdfBetaDesdeEncomienda.mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/registro-exitoso',
          state: {
            result: {
              id: 10,
              codigo_encomienda: 'J000000010',
              estado: 'REGISTRADA',
            },
            payment: { method: 'card', status: 'approved' },
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /emitir e imprimir boleta/i }));
    await waitFor(() => expect(generarPdfBetaDesdeEncomienda).toHaveBeenCalledWith({
      encomienda_id: 10,
      confirmar_pago: true,
    }));
    expect(replace).toHaveBeenCalledWith('blob:test-receipt');
  });

  it('no ofrece etiqueta para un pre-registro', () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/pre-registro-exitoso',
          state: {
            result: {
              id: 11,
              codigo_encomienda: 'J000000011',
              estado: 'PRE_REGISTRADA',
            },
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: /imprimir etiqueta/i })).not.toBeInTheDocument();
  });

  it('muestra boton de pago online para pre-registro con resumen', () => {
    const summary = {
      origen: 'Trujillo',
      destino: 'Shorey',
      tipo_contenido: 'ROPA',
      descripcion: 'Camisas',
      peso_kg: '2',
      fragilidad: 'BAJA',
    };

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/pre-registro-exitoso',
          state: {
            result: {
              id: 12,
              codigo_encomienda: 'J000000012',
              estado: 'PRE_REGISTRADA',
            },
            summary,
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /pagar ahora por internet/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /imprimir etiqueta/i })).not.toBeInTheDocument();
  });

  it('con autoPay abre directamente la vista de confirmacion y pago', () => {
    const summary = {
      origen: 'Trujillo',
      destino: 'Shorey',
      tipo_contenido: 'ROPA',
      descripcion: 'Caja de ropa',
      peso_kg: '5',
      largo_cm: '30',
      ancho_cm: '20',
      alto_cm: '15',
      fragilidad: 'BAJA',
      orientacion_base: 'LARGO_ANCHO',
    };

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/pre-registro-exitoso',
          state: {
            result: { id: 20, codigo_encomienda: 'D000000020', estado: 'PRE_REGISTRADA' },
            summary,
            autoPay: true,
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    // Debe entrar directo al paso de pago, sin requerir clic en "Pagar ahora por internet".
    expect(screen.getByRole('heading', { name: /completa el pago/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pagar ahora por internet/i })).not.toBeInTheDocument();
  });

  it('bloquea el pago si falta la cara/base del paquete (caso CarmiBot)', () => {
    const summary = {
      origen: 'Trujillo',
      destino: 'Shorey',
      tipo_contenido: 'ROPA',
      descripcion: 'refrigerador',
      peso_kg: '80',
      largo_cm: '100',
      ancho_cm: '70',
      alto_cm: '188',
      fragilidad: 'MEDIA',
      // sin orientacion_base (pre-registro de CarmiBot)
    };

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/pre-registro-exitoso',
          state: {
            result: { id: 21, codigo_encomienda: 'D000000021', estado: 'PRE_REGISTRADA' },
            summary,
            autoPay: true,
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    // El selector de base aparece dentro de la misma vista de pago.
    expect(screen.getByTestId('base-selector')).toBeInTheDocument();
    // Y el pago queda bloqueado hasta seleccionarla.
    expect(screen.getByText(/selecciona la cara\/base del paquete/i)).toBeInTheDocument();
  });

  it('tras confirmar pre-registro online muestra opciones de impresion', async () => {
    confirmarPreRegistro.mockResolvedValue({
      id: 13,
      codigo_encomienda: 'J000000013',
      estado: 'REGISTRADA',
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const summary = {
      origen: 'Trujillo',
      destino: 'Shorey',
      tipo_contenido: 'ROPA',
      descripcion: 'Camisas',
      peso_kg: '2',
      largo_cm: '30',
      ancho_cm: '20',
      alto_cm: '15',
      fragilidad: 'BAJA',
      orientacion_base: 'LARGO_ANCHO',
    };

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/pre-registro-exitoso',
          state: {
            result: {
              id: 13,
              codigo_encomienda: 'J000000013',
              estado: 'PRE_REGISTRADA',
            },
            summary,
          },
        }]}
      >
        <RegistroExitosoPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /pagar ahora por internet/i }));
    expect(screen.getByRole('heading', { name: /completa el pago/i })).toBeInTheDocument();
  });
});
