import apiClient from './apiClient.js';
import { clearAuthSession, getStoredAuthToken, getStoredAuthUser, saveAuthSession } from '../auth/session.js';

export async function login({ username, password }) {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
  });
  saveAuthSession(response.data);
  return response.data;
}

export function getCurrentAuthSession() {
  const token = getStoredAuthToken();
  const user = getStoredAuthUser();

  if (!token || !user) {
    return null;
  }

  return { token, user };
}

export function logout() {
  clearAuthSession();
}

export const authService = {
  login,
  logout,
  getCurrentAuthSession,
};
