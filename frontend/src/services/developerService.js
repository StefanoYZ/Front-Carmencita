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
  exportTable,
};
