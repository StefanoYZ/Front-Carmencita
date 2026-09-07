export function getNestedValue(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

export function extractSunatSummary(response = {}) {
  const raw = response.raw_response || {};
  const cdrResponse = raw?.sunatResponse?.cdrResponse || {};
  const isLocalReceipt = response.ambiente === 'mock';

  return {
    success: response.success,
    ambiente: isLocalReceipt ? 'beta' : response.ambiente,
    estado: response.estado === 'ACEPTADO_MOCK' ? 'ACEPTADO' : response.estado,
    serie: response.serie,
    numero: response.numero,
    fecha_emision: response.fecha_emision,
    codigo_encomienda: response.codigo_encomienda,
    subtotal: response.subtotal,
    igv: response.igv,
    total: response.total,
    moneda: response.moneda,
    mensaje: isLocalReceipt ? 'Boleta generada correctamente.' : response.mensaje,
    hash: response.hash || raw.hash,
    cdr: response.cdr || raw?.sunatResponse?.cdrZip,
    cdr_code: response.cdr_code || cdrResponse.code,
    cdr_description: response.cdr_description || cdrResponse.description,
    cdr_notes: response.cdr_notes || cdrResponse.notes || [],
    xml: response.xml || raw.xml,
    pdf_url: response.pdf_url,
    raw_response: isLocalReceipt ? {} : raw,
  };
}
