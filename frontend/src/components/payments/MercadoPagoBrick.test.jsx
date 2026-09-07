import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MercadoPagoBrick from './MercadoPagoBrick.jsx';


describe('MercadoPagoBrick', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete window.MercadoPago;
    vi.unstubAllGlobals();
  });

  it('no intenta crear el Brick si el usuario cambia de metodo antes de cargar la llave', async () => {
    let resolveFetch;
    const create = vi.fn();
    window.MercadoPago = vi.fn(() => ({
      bricks: () => ({ create }),
    }));
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
      resolveFetch = resolve;
    })));

    const onError = vi.fn();
    const view = render(<MercadoPagoBrick amount={25} onError={onError} />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    view.unmount();

    await act(async () => {
      resolveFetch({
        ok: true,
        text: async () => JSON.stringify({ publicKey: 'TEST-public-key' }),
      });
      await Promise.resolve();
    });

    expect(create).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('crea solo metodos de tarjeta sin mostrar instrucciones amarillas', async () => {
    const create = vi.fn().mockResolvedValue({ unmount: vi.fn() });
    window.MercadoPago = vi.fn(() => ({
      bricks: () => ({ create }),
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ publicKey: 'TEST-public-key' }),
    }));

    const view = render(<MercadoPagoBrick amount={25} />);
    await waitFor(() => expect(create).toHaveBeenCalledOnce());

    const [, , settings] = create.mock.calls[0];
    expect(settings.customization.paymentMethods).toEqual({
      creditCard: 'all',
      debitCard: 'all',
      maxInstallments: 1,
    });
    expect(settings.initialization.payer).not.toHaveProperty('entityType');
    expect(view.queryByText(/entorno de prueba/i)).not.toBeInTheDocument();
  });
});
