const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_FRAGILITY_VALUES = ['BAJA', 'MEDIA', 'ALTA'];

// Limites fisicos del servicio (camion 491x210x220 cm, 5470 kg). Cota superior de
// sanidad: un peso o dimension por encima no puede transportarse y suele ser un
// error de tipeo. Deben coincidir con app/modules/shipments/constants.py del backend.
export const MAX_WEIGHT_KG = 5470;
export const MAX_DIMENSION_CM = 491;
// Un sobre (DOCUMENTOS) no puede pesar mas de 1.5 kg; por encima es un paquete.
export const MAX_ENVELOPE_WEIGHT_KG = 1.5;

const CONTENT_TYPE_LABELS = {
  DOCUMENTOS: 'Documentos',
  ROPA: 'Ropa',
  ELECTRONICOS: 'Electronicos',
  ELECTRODOMESTICOS: 'Electrodomesticos',
  ALIMENTOS: 'Alimentos',
  OTROS: 'Otros',
};

const CONTENT_KEYWORDS = {
  DOCUMENTOS: ['documento', 'documentos', 'papel', 'papeles', 'carta', 'cartas', 'sobre', 'sobres', 'contrato', 'expediente', 'factura', 'boleta', 'libro', 'cuaderno', 'folder'],
  ROPA: ['ropa', 'ropas', 'polo', 'polos', 'camisa', 'camisas', 'pantalon', 'pantalones', 'vestido', 'casaca', 'chompa', 'zapato', 'zapatos', 'calzado', 'zapatilla', 'zapatillas', 'prenda', 'prendas', 'abrigo', 'jean', 'jeans', 'short', 'falda', 'blusa', 'tela', 'buzo', 'terno', 'gorro'],
  ELECTRONICOS: ['televisor', 'tele', 'tv', 'laptop', 'computadora', 'pc', 'celular', 'telefono', 'radio', 'parlante', 'monitor', 'tablet', 'camara', 'consola', 'electronico', 'electronicos', 'audifono', 'cargador', 'impresora', 'router', 'mouse', 'teclado'],
  ELECTRODOMESTICOS: ['refrigeradora', 'refrigerador', 'refri', 'congeladora', 'congelador', 'frigobar', 'cocina', 'cocinas', 'horno', 'hornos', 'microondas', 'licuadora', 'licuadoras', 'lavadora', 'secadora', 'aspiradora', 'plancha', 'ventilador', 'batidora', 'tostadora', 'hervidor', 'extractor', 'campana', 'terma', 'calentador', 'freidora', 'olla', 'arrocera', 'electrodomestico', 'electrodomesticos'],
  ALIMENTOS: ['papa', 'papas', 'arroz', 'azucar', 'harina', 'fruta', 'frutas', 'verdura', 'verduras', 'comida', 'alimento', 'alimentos', 'grano', 'menestra', 'menestras', 'conserva', 'conservas', 'fideo', 'fideos', 'aceite', 'cereal', 'cafe', 'cacao', 'quinua', 'maiz', 'trigo', 'pan', 'queso', 'huevo', 'huevos', 'leche', 'galleta', 'galletas', 'chocolate', 'miel', 'snack'],
};

const COMPATIBLE_CONTENT_TYPES = [
  ['ELECTRONICOS', 'ELECTRODOMESTICOS'],
];

const SEMANTIC_CONTENT_PATTERNS = [
  {
    category: 'ELECTRODOMESTICOS',
    patterns: [
      'aparato para conservar alimentos',
      'conservar alimentos en frio',
      'enfriar comida',
      'enfriar alimentos',
      'mantener comida fria',
    ],
  },
  {
    category: 'ELECTRONICOS',
    patterns: [
      'reproducir sonido',
      'equipo de sonido',
      'aparato de sonido',
    ],
  },
];

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

export function validatePositiveNumber(value, message = 'Debe ser mayor a 0.', { max = null, maxMessage = null } = {}) {
  const text = String(value ?? '').trim();
  if (!text) return message;
  if (!/^\d+(\.\d+)?$/.test(text)) return 'Solo se permiten numeros.';
  const num = Number(text);
  if (!(num > 0)) return message;
  if (max != null && num > max) return maxMessage || `No debe superar ${max}.`;
  return '';
}

// Validadores de peso y dimension con cota superior (min > 0, max = limite fisico).
export function validateWeight(value) {
  return validatePositiveNumber(value, 'El peso debe ser mayor a 0.', {
    max: MAX_WEIGHT_KG,
    maxMessage: `El peso no debe superar ${MAX_WEIGHT_KG} kg.`,
  });
}

export function validateDimension(value) {
  return validatePositiveNumber(value, 'Las dimensiones deben ser mayores a 0.', {
    max: MAX_DIMENSION_CM,
    maxMessage: `Las dimensiones no deben superar ${MAX_DIMENSION_CM} cm.`,
  });
}

// Peso de un sobre (DOCUMENTOS): > 0 y con cota superior de 1.5 kg.
export function validateEnvelopeWeight(value) {
  return validatePositiveNumber(value, 'El peso debe ser mayor a 0.', {
    max: MAX_ENVELOPE_WEIGHT_KG,
    maxMessage: `Un sobre no puede pesar mas de ${MAX_ENVELOPE_WEIGHT_KG} kg.`,
  });
}

// Fuente unica de validacion numerica de encomiendas: peso siempre; dimensiones
// solo si no es sobre (DOCUMENTOS). La usan TODAS las vistas (registro publico,
// registro interno y cotizacion) para garantizar reglas y mensajes identicos.
export function validateShipmentNumericFields(form, { isEnvelope = false } = {}) {
  const errors = {};
  const weightValue = form.peso_kg ?? form.peso;
  const weightError = isEnvelope ? validateEnvelopeWeight(weightValue) : validateWeight(weightValue);
  if (weightError) errors.peso_kg = weightError;
  if (!isEnvelope) {
    ['largo_cm', 'ancho_cm', 'alto_cm'].forEach((field) => {
      const error = validateDimension(form[field]);
      if (error) errors[field] = error;
    });
  }
  return errors;
}

// Validacion EN VIVO de un unico campo numerico (peso o dimension) mientras el
// usuario escribe: devuelve el mensaje de limite logico apenas se supera la cota
// (o el valor no es valido), o '' cuando esta vacio o no aplica. Reconoce los dos
// sufijos usados en el frontend (peso/peso_kg, largo/largo_cm, ...) para que todas
// las vistas muestren el mismo aviso sin esperar al submit.
const WEIGHT_FIELD_NAMES = ['peso', 'peso_kg'];
const DIMENSION_FIELD_NAMES = ['largo', 'ancho', 'alto', 'largo_cm', 'ancho_cm', 'alto_cm'];

export function isShipmentNumericField(name) {
  return WEIGHT_FIELD_NAMES.includes(name) || DIMENSION_FIELD_NAMES.includes(name);
}

export function validateShipmentNumericField(name, value, { isEnvelope = false } = {}) {
  if (!String(value ?? '').trim()) return '';
  if (WEIGHT_FIELD_NAMES.includes(name)) {
    return isEnvelope ? validateEnvelopeWeight(value) : validateWeight(value);
  }
  // Los sobres no llevan dimensiones: no se valida su cota.
  if (DIMENSION_FIELD_NAMES.includes(name)) return isEnvelope ? '' : validateDimension(value);
  return '';
}

// Regla de negocio: remitente y destinatario solo pueden compartir celular/correo
// si son la MISMA persona (mismo DNI). Si el DNI difiere (o el destinatario no
// tiene DNI), no se permite el mismo celular ni el mismo correo.
export function validateDistinctContact(form, prefixes = ['remitente', 'destinatario']) {
  const errors = {};
  const [a, b] = prefixes;
  const docA = String(form[`${a}_numero_documento`] || '').trim();
  const docB = String(form[`${b}_numero_documento`] || '').trim();
  if (docA && docB && docA === docB) return errors; // misma persona: permitido

  const phoneA = String(form[`${a}_telefono`] || '').trim();
  const phoneB = String(form[`${b}_telefono`] || '').trim();
  if (phoneA && phoneB && phoneA === phoneB) {
    errors[`${b}_telefono`] = 'El destinatario no puede tener el mismo celular que el remitente (solo si es la misma persona).';
  }
  const emailA = String(form[`${a}_correo`] || '').trim().toLowerCase();
  const emailB = String(form[`${b}_correo`] || '').trim().toLowerCase();
  if (emailA && emailB && emailA === emailB) {
    errors[`${b}_correo`] = 'El destinatario no puede tener el mismo correo que el remitente (solo si es la misma persona).';
  }
  return errors;
}

export function validateFragility(value) {
  const fragility = String(value || '').trim().toUpperCase();
  if (!fragility) return 'Seleccione una fragilidad.';
  return VALID_FRAGILITY_VALUES.includes(fragility) ? '' : 'Seleccione fragilidad baja, media o alta.';
}

export function validateContentType(value) {
  return String(value || '').trim() ? '' : 'Seleccione el tipo de contenido.';
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferContentCategory(description) {
  const normalized = normalizeText(description);
  const semanticMatch = SEMANTIC_CONTENT_PATTERNS.find(({ patterns }) => (
    patterns.some((pattern) => normalized.includes(pattern))
  ));
  if (semanticMatch) return semanticMatch.category;

  const tokens = normalized.match(/[a-z0-9ñ]+/g) || [];
  const scores = Object.entries(CONTENT_KEYWORDS).reduce((acc, [category, keywords]) => {
    const hits = tokens.filter((token) => keywords.includes(token)).length;
    if (hits) acc[category] = hits;
    return acc;
  }, {});

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

function areContentTypesCompatible(a, b) {
  if (!a || !b || a === b) return true;
  if (a === 'OTROS' || b === 'OTROS') return true;
  return COMPATIBLE_CONTENT_TYPES.some((group) => group.includes(a) && group.includes(b));
}

export function validateContentDescriptionCoherence(contentType, description) {
  const selectedType = String(contentType || '').trim().toUpperCase();
  const inferredType = inferContentCategory(description);
  if (!selectedType || !inferredType || areContentTypesCompatible(selectedType, inferredType)) return '';

  return `El tipo de contenido seleccionado (${CONTENT_TYPE_LABELS[selectedType] || selectedType}) no coincide con la descripcion. Parece corresponder a ${CONTENT_TYPE_LABELS[inferredType] || inferredType}.`;
}

const BASE_VERTICAL_DIMENSION = {
  LARGO_ANCHO: 'alto',
  LARGO_ALTO: 'ancho',
  ANCHO_ALTO: 'largo',
};

export function validatePackageBaseOrientation({
  contentType,
  description,
  fragility,
  baseOrientation,
  lengthCm,
  widthCm,
  heightCm,
}) {
  const type = String(contentType || '').trim().toUpperCase();
  const inferredType = inferContentCategory(description);
  const fragilityValue = String(fragility || '').trim().toUpperCase();
  const orientation = String(baseOrientation || '').trim().toUpperCase();
  const verticalDimension = BASE_VERTICAL_DIMENSION[orientation];

  if (!verticalDimension) return '';

  const shouldStand = type === 'ELECTRODOMESTICOS' || inferredType === 'ELECTRODOMESTICOS' || fragilityValue === 'ALTA';
  if (!shouldStand) return '';

  const dimensions = {
    largo: Number(lengthCm),
    ancho: Number(widthCm),
    alto: Number(heightCm),
  };
  if (Object.values(dimensions).some((dimension) => !Number.isFinite(dimension) || dimension <= 0)) return '';

  const selectedVerticalSize = dimensions[verticalDimension];
  const largestSize = Math.max(...Object.values(dimensions));
  if (largestSize > selectedVerticalSize * 1.3) {
    return 'La cara seleccionada haria que el paquete viaje acostado. Para electrodomesticos o paquetes muy fragiles, selecciona una base que lo mantenga parado y estable.';
  }

  return '';
}
