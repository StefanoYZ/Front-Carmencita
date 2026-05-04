import axios from 'axios';
import { API_CONFIG } from '../config/api.config.js';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralizar aqui el manejo de errores cuando FastAPI este conectado.
    return Promise.reject(error);
  },
);

export default apiClient;
