export const AUTH_TOKEN_KEY = 'carmencita_auth_token';
export const AUTH_USER_KEY = 'carmencita_auth_user';

export function getStoredAuthToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export function getStoredAuthUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function saveAuthSession({ access_token, user }) {
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, access_token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    // Local auth persistence is a convenience; login state still works in memory.
  }
}

export function clearAuthSession() {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    // Ignore unavailable storage.
  }
}
