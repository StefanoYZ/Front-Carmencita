import {
  validateContentType,
  validateDocumentNumber,
  validateEmail,
  validateFragility,
  validatePhone,
  validatePositiveNumber,
} from './shipmentValidation.js';

export const PUBLIC_SHIPMENT_STORAGE_KEY = 'carmencita_public_shipment';
export const PUBLIC_QUOTE_STORAGE_KEY = 'carmencita_public_quote';
export const PUBLIC_SUCCESS_STORAGE_KEY = 'carmencita_public_success';

export const emptyPublicShipmentForm = {
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
  destino: 'Angasmarca',
  descripcion: '',
  tipo_contenido: '',
  peso_kg: '',
  largo_cm: '',
  ancho_cm: '',
  alto_cm: '',
  fragilidad: 'BAJA',
};

export function readSessionJSON(key, fallback = null) {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeSessionJSON(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Session persistence is a convenience only; the form still works without it.
  }
}

export function clearSessionKey(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    // Ignore unavailable storage.
  }
}

export function quoteEstimateFromForm(form) {
  const weight = Number(form.peso_kg || form.peso || 0);
  const length = Number(form.largo_cm || form.largo || 0);
  const width = Number(form.ancho_cm || form.ancho || 0);
  const height = Number(form.alto_cm || form.alto || 0);
  const volume = length * width * height;
  const fragility = String(form.fragilidad || '').toUpperCase();

  const baseRate = normalizeRoute(form.origen, form.destino) === 'TRUJILLO_ANGASMARCA' ? 10 : 12;
  const weightCost = weight * 2;
  const volumeCost = (volume / 1000000) * 20;
  const fragilitySurcharge = fragility === 'ALTA' ? 10 : 0;
  const subtotal = roundMoney(baseRate + weightCost + volumeCost + fragilitySurcharge);
  const igv = roundMoney(subtotal * 0.18);
  const total = roundMoney(subtotal + igv);

  return {
    baseRate,
    fragilitySurcharge,
    igv,
    subtotal,
    total,
  };
}

export function quoteEstimateFromPublicQuote(form) {
  const mapped = {
    origen: form.origen || 'Trujillo',
    destino: form.destino || 'Angasmarca',
    peso_kg: form.peso,
    largo_cm: form.largo,
    ancho_cm: form.ancho,
    alto_cm: form.alto,
    fragilidad: form.fragilidad === 'Fragil' ? 'ALTA' : 'BAJA',
  };
  return quoteEstimateFromForm(mapped);
}

export function mapQuoteToShipmentForm(quote) {
  if (!quote) return {};

  return {
    origen: quote.origen || 'Trujillo',
    destino: quote.destino || 'Angasmarca',
    tipo_contenido: quote.tipo === 'Sobres' ? 'DOCUMENTOS' : quote.tipo ? 'PAQUETE' : '',
    peso_kg: quote.peso || '',
    largo_cm: quote.largo || '',
    ancho_cm: quote.ancho || '',
    alto_cm: quote.alto || '',
    fragilidad: quote.fragilidad === 'Fragil' ? 'ALTA' : 'BAJA',
  };
}

export function buildPublicShipmentPayload(form) {
  return {
    remitente_tipo_documento: String(form.remitente_tipo_documento || '').trim().toUpperCase(),
    remitente_numero_documento: String(form.remitente_numero_documento || '').trim(),
    remitente_nombre: String(form.remitente_nombre || '').trim(),
    remitente_direccion: optionalText(form.remitente_direccion),
    remitente_telefono: String(form.remitente_telefono || '').trim(),
    remitente_correo: optionalText(form.remitente_correo),
    destinatario_tipo_documento: String(form.destinatario_tipo_documento || '').trim().toUpperCase(),
    destinatario_numero_documento: String(form.destinatario_numero_documento || '').trim(),
    destinatario_nombre: String(form.destinatario_nombre || '').trim(),
    destinatario_direccion: optionalText(form.destinatario_direccion),
    destinatario_telefono: String(form.destinatario_telefono || '').trim(),
    destinatario_correo: optionalText(form.destinatario_correo),
    origen: String(form.origen || '').trim(),
    destino: String(form.destino || '').trim(),
    descripcion: String(form.descripcion || '').trim(),
    tipo_contenido: String(form.tipo_contenido || '').trim().toUpperCase(),
    peso_kg: Number(form.peso_kg),
    largo_cm: Number(form.largo_cm),
    ancho_cm: Number(form.ancho_cm),
    alto_cm: Number(form.alto_cm),
    fragilidad: String(form.fragilidad || '').trim().toUpperCase(),
  };
}

export function validatePublicShipmentForm(form) {
  const errors = {};

  validatePerson('remitente', form, errors);
  validatePerson('destinatario', form, errors);

  [
    ['origen', 'El origen es obligatorio.'],
    ['destino', 'El destino es obligatorio.'],
    ['descripcion', 'La descripcion es obligatoria.'],
    ['tipo_contenido', 'Selecciona el tipo de contenido.'],
    ['fragilidad', 'Selecciona la fragilidad.'],
  ].forEach(([field, message]) => {
    if (!String(form[field] || '').trim()) {
      errors[field] = message;
    }
  });

  const contentError = validateContentType(form.tipo_contenido);
  if (contentError) errors.tipo_contenido = contentError;

  const fragilityError = validateFragility(form.fragilidad);
  if (fragilityError) errors.fragilidad = fragilityError;

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

  return errors;
}

function validatePerson(prefix, form, errors) {
  const readable = prefix === 'remitente' ? 'remitente' : 'destinatario';
  const docType = String(form[`${prefix}_tipo_documento`] || '').toUpperCase();
  const docNumber = String(form[`${prefix}_numero_documento`] || '').trim();
  const email = String(form[`${prefix}_correo`] || '').trim();

  if (!docType) errors[`${prefix}_tipo_documento`] = 'Selecciona el tipo de documento.';
  const documentError = validateDocumentNumber(docType, docNumber);
  if (documentError) errors[`${prefix}_numero_documento`] = documentError;
  if (!String(form[`${prefix}_nombre`] || '').trim()) {
    errors[`${prefix}_nombre`] = `Ingresa el nombre del ${readable}.`;
  }
  const phoneError = validatePhone(form[`${prefix}_telefono`], { required: true });
  if (phoneError) errors[`${prefix}_telefono`] = phoneError;
  const emailError = validateEmail(email);
  if (emailError) errors[`${prefix}_correo`] = emailError;
}

function normalizeRoute(origin, destination) {
  const key = `${String(origin || '').trim().toUpperCase()}_${String(destination || '').trim().toUpperCase()}`;
  if (key === 'TRUJILLO_ANGASMARCA') return 'TRUJILLO_ANGASMARCA';
  return key;
}

function optionalText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}
