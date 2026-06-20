import axios from 'axios';
import { API_CONFIG } from '../config/api.config.js';
import { getStoredAuthToken } from '../auth/session.js';

export const apiBaseURL = API_CONFIG.baseURL.replace(/\/$/, '');

export function getBackendBaseURL() {
  return apiBaseURL.replace(/\/api\/v1$/, '');
}

export function getApiErrorMessage(error, fallback = 'No se pudo completar la operacion.') {
  if (!error?.response) {
    const message = error?.message || '';
    if (error?.code === 'ECONNABORTED' || message.toLowerCase().includes('timeout')) {
      return 'La simulacion excedio el tiempo de espera. Reduce la cantidad de paquetes o prueba un algoritmo mas ligero.';
    }
    if (message.toLowerCase().includes('cors')) {
      return 'Error CORS. Verifica la configuracion de origenes permitidos en FastAPI.';
    }
    return 'Backend no disponible. Verifica que FastAPI este encendido y que el puerto configurado sea correcto.';
  }

  const status = error.response.status;
  const payload = error.response.data;
  const detail = Array.isArray(payload?.detail)
    ? payload.detail.map((item) => item.msg || JSON.stringify(item)).join(' ')
    : payload?.detail || payload?.message || payload?.mensaje;
  const rawText = JSON.stringify(payload || {}).toLowerCase();

  if (rawText.includes('lycet')) {
    return detail || 'Lycet no disponible. Verifica que el servicio este levantado.';
  }

  if (rawText.includes('sunat_env') || rawText.includes('beta')) {
    return detail || 'La configuracion SUNAT no permite esta operacion.';
  }

  if (status === 404) {
    return detail || 'Endpoint no encontrado o recurso inexistente.';
  }

  if (status === 422) {
    return detail || 'Error de validacion de FastAPI. Revisa los campos enviados.';
  }

  if (status >= 500) {
    return detail || 'Error interno del backend.';
  }

  return detail || fallback;
}

const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('carmencita:auth-expired'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
