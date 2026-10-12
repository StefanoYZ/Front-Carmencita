import Badge from './Badge.jsx';

/**
 * Insignia de estado reutilizable. Mapea el estado del sistema a un color
 * semantico y muestra texto + punto (no depende solo del color).
 */
const TONE_BY_STATE = {
  // Encomiendas
  PRE_REGISTRADA: 'gray',
  REGISTRADA: 'gray',
  COTIZADA: 'gray',
  PENDIENTE: 'gray',
  PAGO_CONFIRMADO: 'green',
  BOLETA_EMITIDA: 'green',
  EN_ALMACEN: 'amber',
  EN_CARGA: 'amber',
  EN_TRANSITO: 'amber',
  EN_RUTA: 'amber',
  ENTREGADA: 'green',
  ANULADA: 'red',
  RECIBIDO: 'gray',
  EN_REVISION: 'amber',
  ESPERANDO_INFORMACION: 'amber',
  INVESTIGANDO: 'amber',
  PROPUESTA_ENVIADA: 'green',
  PAGO_POR_VERIFICAR: 'amber',
  RESUELTO: 'green',
  NO_PROCEDE: 'red',
  CERRADO: 'gray',
  // Estado activo/inactivo (destinos, usuarios)
  ACTIVO: 'green',
  INACTIVO: 'gray',
};

export default function StatusBadge({ value, fallback = 'SIN ESTADO' }) {
  const key = String(value || '').trim().toUpperCase();
  const tone = TONE_BY_STATE[key] || 'gray';
  const label = key ? key.replace(/_/g, ' ') : fallback;
  return <Badge tone={tone}>{label}</Badge>;
}
