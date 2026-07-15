import {
  sanitizeShipmentField,
  validateDistinctContact,
  validateDocumentNumber,
  validateEmail,
  validateFragility,
  validateContentDescriptionCoherence,
  validateContentType,
  validatePackageBaseOrientation,
  validatePhone,
  validateShipmentNumericFields,
} from './shipmentValidation.js';

export const emptyEncomiendaForm = {
  remitente_tipo_documento: 'DNI',
  remitente_numero_documento: '',
  remitente_nombre: '',
  remitente_direccion: '',
  remitente_telefono: '',
  remitente_correo: '',
  destinatario_tipo_documento: 'DNI',
  destinatario_numero_documento: '',
  destinatario_nombre: '',
  destinatario_direccion: '',
  destinatario_telefono: '',
  destinatario_correo: '',
  origen: 'Trujillo',
  destino: '',
  descripcion: '',
  tipo_contenido: '',
  peso_kg: '',
  largo_cm: '',
  ancho_cm: '',
  alto_cm: '',
  fragilidad: 'BAJA',
  orientacion_base: '',
};

export const ESTADOS_ENCOMIENDA = [
  'REGISTRADA',
  'COTIZADA',
  'PAGO_CONFIRMADO',
  'BOLETA_EMITIDA',
  'EN_TRANSITO',
  'ENTREGADA',
  'ANULADA',
];

export function normalizeEncomiendasList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function buildEncomiendaPayload(form) {
  const isEnvelope = isEnvelopeContent(form.tipo_contenido);
  const payload = {
    ...form,
    remitente_tipo_documento: String(form.remitente_tipo_documento || '').trim().toUpperCase(),
    remitente_numero_documento: String(form.remitente_numero_documento || '').trim(),
    remitente_telefono: String(form.remitente_telefono || '').trim(),
    remitente_correo: optionalText(form.remitente_correo),
    destinatario_tipo_documento: String(form.destinatario_tipo_documento || '').trim().toUpperCase(),
    destinatario_numero_documento: String(form.destinatario_numero_documento || '').trim(),
    destinatario_telefono: String(form.destinatario_telefono || '').trim(),
    destinatario_correo: optionalText(form.destinatario_correo),
    tipo_contenido: String(form.tipo_contenido || '').trim().toUpperCase(),
    peso_kg: Number(form.peso_kg),
    largo_cm: isEnvelope ? 0 : Number(form.largo_cm),
    ancho_cm: isEnvelope ? 0 : Number(form.ancho_cm),
    alto_cm: isEnvelope ? 0 : Number(form.alto_cm),
    fragilidad: isEnvelope ? 'BAJA' : form.fragilidad.toUpperCase(),
    orientacion_base: isEnvelope ? null : String(form.orientacion_base || '').trim().toUpperCase(),
  };

  delete payload.id;
  delete payload.codigo_encomienda;
  delete payload.created_at;
  delete payload.updated_at;
  delete payload.fecha_creacion;
  delete payload.fecha_actualizacion;

  if (!payload.estado) {
    delete payload.estado;
  }

  return payload;
}

export function getDimensions(encomienda) {
  return `${encomienda.largo_cm || '-'} x ${encomienda.ancho_cm || '-'} x ${encomienda.alto_cm || '-'} cm`;
}

// Estados en los que la encomienda ya NO se puede editar (a partir de transito).
const NON_EDITABLE_STATES = new Set(['EN_TRANSITO', 'EN_RUTA', 'ENTREGADA', 'ANULADA']);

/** Solo se permite editar mientras la encomienda no haya pasado a transito o mas alla. */
export function canEditEncomienda(estado) {
  return !NON_EDITABLE_STATES.has(String(estado || '').trim().toUpperCase());
}

/** Ordena de mas reciente a mas antiguo (por fecha de creacion, luego id). */
export function sortEncomiendasByRecent(items) {
  return [...items].sort((a, b) => {
    const at = new Date(a.fecha_creacion || a.created_at || 0).getTime();
    const bt = new Date(b.fecha_creacion || b.created_at || 0).getTime();
    if (bt !== at) return bt - at;
    return Number(b.id || 0) - Number(a.id || 0);
  });
}

export function validateEncomiendaForm(form, { includeEstado = false } = {}) {
  return Object.values(validateEncomiendaFormFields(form, { includeEstado }));
}

export function normalizeEncomiendaForForm(encomienda) {
  if (!encomienda) return emptyEncomiendaForm;

  return {
    remitente_tipo_documento: encomienda.remitente_tipo_documento || 'DNI',
    remitente_numero_documento: encomienda.remitente_numero_documento || '',
    remitente_nombre: encomienda.remitente_nombre || '',
    remitente_direccion: encomienda.remitente_direccion || '',
    remitente_telefono: encomienda.remitente_telefono || '',
    remitente_correo: encomienda.remitente_correo || '',
    destinatario_tipo_documento: encomienda.destinatario_tipo_documento || 'DNI',
    destinatario_numero_documento: encomienda.destinatario_numero_documento || '',
    destinatario_nombre: encomienda.destinatario_nombre || '',
    destinatario_direccion: encomienda.destinatario_direccion || '',
    destinatario_telefono: encomienda.destinatario_telefono || '',
    destinatario_correo: encomienda.destinatario_correo || '',
    origen: encomienda.origen || 'Trujillo',
    destino: encomienda.destino || '',
    descripcion: encomienda.descripcion || '',
    tipo_contenido: encomienda.tipo_contenido || '',
    peso_kg: encomienda.peso_kg || '',
    largo_cm: encomienda.largo_cm || '',
    ancho_cm: encomienda.ancho_cm || '',
    alto_cm: encomienda.alto_cm || '',
    fragilidad: normalizeFragilityForForm(encomienda.fragilidad),
    orientacion_base: encomienda.orientacion_base || '',
    estado: encomienda.estado || 'REGISTRADA',
  };
}

export function sanitizeEncomiendaField(name, value, form) {
  return sanitizeShipmentField(name, value, form);
}

export function validateEncomiendaFormFields(form, { includeEstado = false } = {}) {
  const errors = {};
  const requiredFields = [
    ['remitente_numero_documento', 'Documento del remitente es obligatorio.'],
    ['remitente_nombre', 'Nombre del remitente es obligatorio.'],
    ['destinatario_nombre', 'Nombre del destinatario es obligatorio.'],
    ['origen', 'Origen es obligatorio.'],
    ['destino', 'Destino es obligatorio.'],
    ['descripcion', 'Descripcion es obligatoria.'],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!String(form[field] || '').trim()) {
      errors[field] = message;
    }
  });

  if (
    String(form.origen || '').trim()
    && String(form.destino || '').trim()
    && normalizeLocation(form.origen) === normalizeLocation(form.destino)
  ) {
    errors.destino = 'El destino debe ser diferente al origen.';
  }

  const senderDocumentError = validateDocumentNumber(form.remitente_tipo_documento, form.remitente_numero_documento);
  if (senderDocumentError) errors.remitente_numero_documento = senderDocumentError;

  if (form.destinatario_numero_documento || form.destinatario_tipo_documento === 'DNI') {
    const recipientDocumentError = validateDocumentNumber(form.destinatario_tipo_documento, form.destinatario_numero_documento);
    if (recipientDocumentError) errors.destinatario_numero_documento = recipientDocumentError;
  }

  const senderPhoneError = validatePhone(form.remitente_telefono);
  if (senderPhoneError) errors.remitente_telefono = senderPhoneError;
  const senderEmailError = validateEmail(form.remitente_correo);
  if (senderEmailError) errors.remitente_correo = senderEmailError;

  const recipientPhoneError = validatePhone(form.destinatario_telefono);
  if (recipientPhoneError) errors.destinatario_telefono = recipientPhoneError;
  const recipientEmailError = validateEmail(form.destinatario_correo);
  if (recipientEmailError) errors.destinatario_correo = recipientEmailError;

  const contentTypeError = validateContentType(form.tipo_contenido);
  if (contentTypeError) errors.tipo_contenido = contentTypeError;

  const coherenceError = validateContentDescriptionCoherence(form.tipo_contenido, form.descripcion);
  if (coherenceError) errors.tipo_contenido = coherenceError;

  Object.assign(
    errors,
    validateShipmentNumericFields(form, { isEnvelope: isEnvelopeContent(form.tipo_contenido) }),
  );
  Object.assign(errors, validateDistinctContact(form));

  if (!isEnvelopeContent(form.tipo_contenido)) {
    const fragilityError = validateFragility(form.fragilidad);
    if (fragilityError) errors.fragilidad = fragilityError;
    if (!String(form.orientacion_base || '').trim()) {
      errors.orientacion_base = 'Selecciona la cara que ira hacia abajo.';
    } else {
      const orientationError = validatePackageBaseOrientation({
        contentType: form.tipo_contenido,
        description: form.descripcion,
        fragility: form.fragilidad,
        baseOrientation: form.orientacion_base,
        lengthCm: form.largo_cm,
        widthCm: form.ancho_cm,
        heightCm: form.alto_cm,
      });
      if (orientationError) errors.orientacion_base = orientationError;
    }
  }

  if (includeEstado && !ESTADOS_ENCOMIENDA.includes(form.estado)) {
    errors.estado = 'El estado seleccionado no es valido.';
  }

  return errors;
}

function optionalText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function normalizeFragilityForForm(value) {
  const fragility = String(value || '').trim().toUpperCase();
  return ['BAJA', 'MEDIA', 'ALTA'].includes(fragility) ? fragility : 'BAJA';
}

export function isEnvelopeContent(contentType) {
  return String(contentType || '').trim().toUpperCase() === 'DOCUMENTOS';
}

function normalizeLocation(value) {
  return String(value || '').trim().toUpperCase();
}
