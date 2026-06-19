import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_TOKEN_KEY,
  clearAuthSession,
  getStoredAuthToken,
  getStoredAuthUser,
  saveAuthSession,
} from './session.js';

describe('session storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('guarda la autenticacion solamente en sessionStorage', () => {
    saveAuthSession({
      access_token: 'TEST_TOKEN',
      user: { username: 'qa_admin' },
    });
    expect(getStoredAuthToken()).toBe('TEST_TOKEN');
    expect(getStoredAuthUser().username).toBe('qa_admin');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('elimina completamente la sesion', () => {
    saveAuthSession({ access_token: 'TEST_TOKEN', user: { username: 'qa' } });
    clearAuthSession();
    expect(getStoredAuthToken()).toBeNull();
    expect(getStoredAuthUser()).toBeNull();
  });
});
