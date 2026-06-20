import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistroExitosoPage from './RegistroExitosoPage.jsx';
import { getEtiquetaPdf } from '../../services/encomiendasService.js';
import { generarPdfBetaDesdeEncomienda } from '../../services/sunatService.js';

vi.mock('../../services/encomiendasService.js', () => ({
  getEtiquetaPdf: vi.fn(),
}));

vi.mock('../../services/sunatService.js', () => ({
  generarPdfBetaDesdeEncomienda: vi.fn(),
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
});
