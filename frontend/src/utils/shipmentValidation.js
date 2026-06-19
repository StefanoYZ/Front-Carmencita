const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_FRAGILITY_VALUES = ['BAJA', 'MEDIA', 'ALTA'];

export function sanitizeDigits(value, maxLength) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength);
}

export function sanitizeDecimal(value) {
  const normalized = String(value || '').replace(',', '.').replace(/[^\d.]/g, '');
  const [integer = '', ...decimalParts] = normalized.split('.');
  const decimal = decimalParts.join('');
  return decimalParts.length > 0 ? `${integer}.${decimal}` : integer;
}

export function sanitizeShipmentField(name, value, form) {
  if (name.endsWith('_telefono') || name === 'telefono' || name === 'phoneNumber') {
    return sanitizeDigits(value, 9);
  }

  if (name.endsWith('_numero_documento')) {
    const prefix = name.replace('_numero_documento', '');
    const documentType = String(form?.[`${prefix}_tipo_documento`] || '').toUpperCase();
    return documentType === 'DNI' ? sanitizeDigits(value, 8) : String(value || '').trimStart();
  }

  if (name === 'dni_receptor' || name === 'dni_receptor_entrega') {
    return sanitizeDigits(value, 8);
  }

  if (['peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm'].includes(name)) {
    return sanitizeDecimal(value);
  }

  return value;
}

export function validateDocumentNumber(documentType, documentNumber, label = 'DNI') {
  const type = String(documentType || '').toUpperCase();
  const value = String(documentNumber || '').trim();

  if (!value) return 'El documento es obligatorio.';
  if (type !== 'DNI') return '';
  if (!/^\d+$/.test(value)) return 'El DNI solo debe contener numeros.';
  if (value.length !== 8) return 'El DNI debe tener 8 digitos.';
  return '';
}

export function validatePhone(value, { required = false } = {}) {
  const phone = String(value || '').trim();
  if (!phone) return required ? 'El celular debe tener 9 digitos.' : '';
  if (!/^\d+$/.test(phone)) return 'El celular solo debe contener numeros.';
  if (phone.length !== 9) return 'El celular debe tener 9 digitos.';
  if (!phone.startsWith('9')) return 'El celular debe comenzar con 9.';
  if (/^(\d)\1{8}$/.test(phone)) return 'El celular no puede repetir el mismo numero 9 veces.';
  return '';
}

export function validateEmail(value, { required = false } = {}) {
  const email = String(value || '').trim();
  if (!email) return required ? 'Ingrese un correo valido.' : '';
  return EMAIL_PATTERN.test(email) ? '' : 'Ingrese un correo valido.';
}

export function validatePositiveNumber(value, message = 'Debe ser mayor a 0.') {
  const text = String(value ?? '').trim();
  if (!text) return message;
  if (!/^\d+(\.\d+)?$/.test(text)) return 'Solo se permiten numeros.';
  return Number(text) > 0 ? '' : message;
}

export function validateFragility(value) {
  const fragility = String(value || '').trim().toUpperCase();
  if (!fragility) return 'Seleccione una fragilidad.';
  return VALID_FRAGILITY_VALUES.includes(fragility) ? '' : 'Seleccione fragilidad baja, media o alta.';
}

export function validateContentType(value) {
  return String(value || '').trim() ? '' : 'Seleccione el tipo de contenido.';
}
