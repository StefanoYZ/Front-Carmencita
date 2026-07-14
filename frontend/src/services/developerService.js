import apiClient from './apiClient.js';

export async function getTables() {
  const response = await apiClient.get('/developer/tablas');
  return response.data;
}

export async function getTableData(name, { page = 1, pageSize = 50 } = {}) {
  const response = await apiClient.get(`/developer/tablas/${encodeURIComponent(name)}`, {
    params: { page, page_size: pageSize },
  });
  return response.data;
}

export async function getTableSchema(name) {
  const response = await apiClient.get(`/developer/tablas/${encodeURIComponent(name)}/schema`);
  return response.data;
}

export async function createRow(name, data) {
  const response = await apiClient.post(`/developer/tablas/${encodeURIComponent(name)}/filas`, {
    data,
  });
  return response.data.row;
}

export async function updateRow(name, pk, data) {
  const response = await apiClient.put(`/developer/tablas/${encodeURIComponent(name)}/filas`, {
    pk,
    data,
  });
  return response.data.row;
}

export async function deleteRow(name, pk) {
  await apiClient.delete(`/developer/tablas/${encodeURIComponent(name)}/filas`, {
    data: { pk },
  });
}

export async function getOptimizationTestMode() {
  const response = await apiClient.get('/developer/optimizacion/modo-prueba');
  return response.data;
}

export async function setOptimizationTestMode(active, count = null) {
  // count null -> el backend elige cantidad y semilla al azar (lote distinto cada vez).
  const payload = count != null ? { active, count } : { active };
  const response = await apiClient.post('/developer/optimizacion/modo-prueba', payload);
  return response.data;
}

export async function exportTable(name, format) {
  const extension = format === 'excel' ? 'xls' : 'csv';
  const response = await apiClient.get(
    `/developer/tablas/${encodeURIComponent(name)}/export.${extension}`,
    { responseType: 'blob' },
  );
  return response.data;
}

export const developerService = {
  getTables,
  getTableData,
  getTableSchema,
  createRow,
  updateRow,
  deleteRow,
  exportTable,
  getOptimizationTestMode,
  setOptimizationTestMode,
};
