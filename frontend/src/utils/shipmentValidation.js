const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_FRAGILITY_VALUES = ['BAJA', 'MEDIA', 'ALTA'];

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
  ALIMENTOS: ['papa', 'papas', 'arroz', 'azucar', 'harina', 'fruta', 'frutas', 'verdura', 'verduras', 'comida', 'alimento', 'alimentos', 'grano', 'menestra', 'conserva', 'fideo', 'aceite', 'cereal', 'cafe', 'cacao', 'quinua', 'maiz', 'trigo', 'pan', 'queso', 'huevo', 'leche', 'galleta', 'chocolate', 'miel', 'snack'],
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
