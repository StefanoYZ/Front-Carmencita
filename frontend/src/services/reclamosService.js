import apiClient from './apiClient.js';

export async function getClaimPrivacyNotice() {
  const response = await apiClient.get('/reclamos/aviso-privacidad');
  return response.data;
}

export async function getPublicClaimAgencies() {
  const response = await apiClient.get('/reclamos/agencias');
  return response.data;
}

export async function createPublicClaim(payload) {
  const response = await apiClient.post('/reclamos/publicos', payload);
  return response.data;
}

export async function uploadPublicClaimEvidence(caseCode, file, shipmentCode, documentNumber) {
  const response = await apiClient.post(`/reclamos/publicos/${encodeURIComponent(caseCode)}/adjuntos`, file, {
    headers: {
      'Content-Type': file.type,
      'X-Codigo-Encomienda': shipmentCode,
      'X-Numero-Documento': documentNumber,
      'X-Nombre-Archivo': encodeURIComponent(file.name),
    },
  });
  return response.data;
}

export async function lookupPublicClaim(payload) {
  const response = await apiClient.post('/reclamos/consulta', payload);
  return response.data;
}

export async function listClaims({ agencyId, status } = {}) {
  const response = await apiClient.get('/reclamos', {
    params: { agency_id: agencyId || undefined, estado: status || undefined },
  });
  return response.data;
}

export async function createInPersonClaim(payload) {
  const response = await apiClient.post('/reclamos/presencial', payload);
  return response.data;
}

export async function getInPersonClaimSender(agencyId, shipmentCode) {
  const response = await apiClient.get(
    `/reclamos/agencia/${agencyId}/encomiendas/${encodeURIComponent(shipmentCode)}/remitente`,
  );
  return response.data;
}

export async function getPublicClaimSender(shipmentCode) {
  const response = await apiClient.get(
    `/reclamos/publicos/encomiendas/${encodeURIComponent(shipmentCode)}/remitente`,
  );
  return response.data;
}

export async function getClaim(claimId, agencyId) {
  const response = await apiClient.get(`/reclamos/${claimId}`, { params: { agency_id: agencyId } });
  return response.data;
}

export async function createClaimEvent(claimId, agencyId, payload) {
  const response = await apiClient.post(`/reclamos/${claimId}/eventos`, payload, { params: { agency_id: agencyId } });
  return response.data;
}

export async function saveClaimResolution(claimId, agencyId, payload) {
  const response = await apiClient.post(`/reclamos/${claimId}/resolucion`, payload, { params: { agency_id: agencyId } });
  return response.data;
}

export async function verifyClaimPayment(claimId, agencyId, payload) {
  const response = await apiClient.post(`/reclamos/${claimId}/verificar-pago`, payload, { params: { agency_id: agencyId } });
  return response.data;
}

export async function uploadClaimAttachment(claimId, agencyId, file, kind, visibleToCustomer = false) {
  const response = await apiClient.post(`/reclamos/${claimId}/adjuntos`, file, {
    headers: {
      'Content-Type': file.type,
      'X-Tipo-Adjunto': kind,
      'X-Nombre-Archivo': encodeURIComponent(file.name),
      'X-Visible-Cliente': String(visibleToCustomer),
    },
    params: { agency_id: agencyId },
  });
  return response.data;
}

export async function downloadClaimAttachment(claimId, agencyId, attachmentId) {
  const response = await apiClient.get(`/reclamos/${claimId}/adjuntos/${attachmentId}`, { responseType: 'blob', params: { agency_id: agencyId } });
  return response.data;
}

export async function addShipmentTraceEvent(agencyId, shipmentId, payload) {
  const response = await apiClient.post(`/reclamos/agencia/${agencyId}/encomiendas/${shipmentId}/trazabilidad`, payload);
  return response.data;
}
