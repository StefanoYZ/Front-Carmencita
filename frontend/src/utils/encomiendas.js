import {
  sanitizeShipmentField,
  validateDocumentNumber,
  validateEmail,
  validateFragility,
  validateContentType,
  validatePhone,
  validatePositiveNumber,
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
  fragilidad: 'MEDIA',
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
    largo_cm: Number(form.largo_cm),
    ancho_cm: Number(form.ancho_cm),
    alto_cm: Number(form.alto_cm),
    fragilidad: form.fragilidad.toUpperCase(),
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
    fragilidad: encomienda.fragilidad || 'MEDIA',
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

  const numericMessages = {
    peso_kg: 'El peso debe ser mayor a 0.',
    largo_cm: 'Las dimensiones deben ser mayores a 0.',
    ancho_cm: 'Las dimensiones deben ser mayores a 0.',
    alto_cm: 'Las dimensiones deben ser mayores a 0.',
  };

  Object.entries(numericMessages).forEach(([field, message]) => {
    const error = validatePositiveNumber(form[field], message);
    if (error) errors[field] = error;
  });

  const fragilityError = validateFragility(form.fragilidad);
  if (fragilityError) errors.fragilidad = fragilityError;

  if (includeEstado && !ESTADOS_ENCOMIENDA.includes(form.estado)) {
    errors.estado = 'El estado seleccionado no es valido.';
  }

  return errors;
}

function optionalText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}
