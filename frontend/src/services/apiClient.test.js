import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient.js';

const responseErrorHandler = apiClient.interceptors.response.handlers.find((handler) => handler?.rejected)?.rejected;

async function reject401(config) {
  const error = { config, response: { status: 401 } };
  await expect(responseErrorHandler(error)).rejects.toBe(error);
}

describe('apiClient auth-expired handling', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not expire a session for an unauthenticated public request', async () => {
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await reject401({ url: '/clientes/12345678', headers: {} });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not expire an existing session when login credentials are rejected', async () => {
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await reject401({ url: '/auth/login', headers: { Authorization: 'Bearer stale-token' } });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('expires a session when an authenticated endpoint rejects its bearer token', async () => {
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await reject401({ url: '/agencias', headers: { Authorization: 'Bearer expired-token' } });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'carmencita:auth-expired' }));
  });
});
