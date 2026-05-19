export const emptyEncomiendaForm = {
  remitente_tipo_documento: 'DNI',
  remitente_numero_documento: '',
  remitente_nombre: '',
  remitente_direccion: '',
  remitente_telefono: '',
  destinatario_tipo_documento: 'DNI',
  destinatario_numero_documento: '',
  destinatario_nombre: '',
  destinatario_direccion: '',
  destinatario_telefono: '',
  origen: 'Trujillo',
  destino: '',
  descripcion: '',
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
  const errors = [];
  const requiredFields = [
    ['remitente_numero_documento', 'Documento del remitente'],
    ['remitente_nombre', 'Nombre del remitente'],
    ['destinatario_nombre', 'Nombre del destinatario'],
    ['origen', 'Origen'],
    ['destino', 'Destino'],
    ['descripcion', 'Descripcion'],
  ];

  requiredFields.forEach(([field, label]) => {
    if (!String(form[field] || '').trim()) {
      errors.push(`${label} es obligatorio.`);
    }
  });

  if (form.remitente_tipo_documento === 'DNI' && !/^\d{8}$/.test(form.remitente_numero_documento || '')) {
    errors.push('El DNI del remitente debe tener 8 digitos.');
  }

  if (
    form.destinatario_tipo_documento === 'DNI' &&
    form.destinatario_numero_documento &&
    !/^\d{8}$/.test(form.destinatario_numero_documento)
  ) {
    errors.push('El DNI del destinatario debe tener 8 digitos.');
  }

  ['peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm'].forEach((field) => {
    if (Number(form[field]) <= 0) {
      errors.push(`${field} debe ser mayor a 0.`);
    }
  });

  if (!['BAJA', 'MEDIA', 'ALTA'].includes(String(form.fragilidad || '').toUpperCase())) {
    errors.push('La fragilidad debe ser BAJA, MEDIA o ALTA.');
  }

  if (includeEstado && !ESTADOS_ENCOMIENDA.includes(form.estado)) {
    errors.push('El estado seleccionado no es valido.');
  }

  return errors;
}

export function normalizeEncomiendaForForm(encomienda) {
  if (!encomienda) return emptyEncomiendaForm;

  return {
    remitente_tipo_documento: encomienda.remitente_tipo_documento || 'DNI',
    remitente_numero_documento: encomienda.remitente_numero_documento || '',
    remitente_nombre: encomienda.remitente_nombre || '',
    remitente_direccion: encomienda.remitente_direccion || '',
    remitente_telefono: encomienda.remitente_telefono || '',
    destinatario_tipo_documento: encomienda.destinatario_tipo_documento || 'DNI',
    destinatario_numero_documento: encomienda.destinatario_numero_documento || '',
    destinatario_nombre: encomienda.destinatario_nombre || '',
    destinatario_direccion: encomienda.destinatario_direccion || '',
    destinatario_telefono: encomienda.destinatario_telefono || '',
    origen: encomienda.origen || 'Trujillo',
    destino: encomienda.destino || '',
    descripcion: encomienda.descripcion || '',
    peso_kg: encomienda.peso_kg || '',
    largo_cm: encomienda.largo_cm || '',
    ancho_cm: encomienda.ancho_cm || '',
    alto_cm: encomienda.alto_cm || '',
    fragilidad: encomienda.fragilidad || 'MEDIA',
    estado: encomienda.estado || 'REGISTRADA',
  };
}
