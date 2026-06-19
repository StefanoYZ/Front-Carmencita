export const AUTH_TOKEN_KEY = 'carmencita_auth_token';
export const AUTH_USER_KEY = 'carmencita_auth_user';
export const AUTH_LAST_ACTIVITY_KEY = 'carmencita_auth_last_activity';

export function getStoredAuthToken() {
  try {
    return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export function getStoredAuthUser() {
  try {
    const raw = window.sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function saveAuthSession({ access_token, user }) {
  try {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, access_token);
    window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    touchAuthSession();
  } catch (error) {
    // Session persistence is a convenience; login state still works in memory.
  }
}

export function clearAuthSession() {
  try {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    window.sessionStorage.removeItem(AUTH_USER_KEY);
    window.sessionStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
  } catch (error) {
    // Ignore unavailable storage.
  }
}

export function touchAuthSession(timestamp = Date.now()) {
  try {
    window.sessionStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(timestamp));
  } catch (error) {
    // Ignore unavailable storage.
  }
}

export function getAuthLastActivity() {
  try {
    return Number(window.sessionStorage.getItem(AUTH_LAST_ACTIVITY_KEY) || 0);
  } catch (error) {
    return 0;
  }
}

export function clearLegacyAuthSession() {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    window.localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
  } catch (error) {
    // Ignore unavailable storage.
  }
}
