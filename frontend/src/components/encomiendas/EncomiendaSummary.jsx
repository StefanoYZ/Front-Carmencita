import React from 'react';
import Badge from '../common/Badge.jsx';
import Card from '../common/Card.jsx';
import { getDimensions } from '../../utils/encomiendas.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';

function Field({ label, value }) {
  return (
    <div className="rounded-md bg-brand-surface px-3 py-2">
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-gray">{label}</dt>
      <dd className="mt-1 font-semibold text-brand-black">{value || '-'}</dd>
    </div>
  );
}

function statusTone(status) {
  if (status === 'ENTREGADA') return 'green';
  if (status === 'ANULADA') return 'gray';
  if (status === 'EN_TRANSITO') return 'amber';
  return 'amber';
}

function EncomiendaSummary({ encomienda }) {
  if (!encomienda) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <h3 className="text-base font-black text-brand-black">Remitente</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <Field label="Documento" value={`${encomienda.remitente_tipo_documento || '-'} ${encomienda.remitente_numero_documento || ''}`} />
          <Field label="Nombre" value={encomienda.remitente_nombre} />
          <Field label="Direccion" value={encomienda.remitente_direccion} />
          <Field label="Telefono" value={encomienda.remitente_telefono} />
        </dl>
      </Card>

      <Card>
        <h3 className="text-base font-black text-brand-black">Destinatario</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <Field label="Documento" value={`${encomienda.destinatario_tipo_documento || '-'} ${encomienda.destinatario_numero_documento || ''}`} />
          <Field label="Nombre" value={encomienda.destinatario_nombre} />
          <Field label="Direccion" value={encomienda.destinatario_direccion} />
          <Field label="Telefono" value={encomienda.destinatario_telefono} />
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-brand-black">Paquete</h3>
          <Badge tone={statusTone(encomienda.estado)}>{encomienda.estado || 'SIN ESTADO'}</Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm">
          <Field label="Codigo" value={formatShipmentCode(encomienda.codigo_encomienda)} />
          <Field label="Ruta" value={`${encomienda.origen || '-'} -> ${encomienda.destino || '-'}`} />
          <Field label="Descripcion" value={encomienda.descripcion} />
          <Field label="Peso" value={encomienda.peso_kg ? `${encomienda.peso_kg} kg` : '-'} />
          <Field label="Dimensiones" value={getDimensions(encomienda)} />
          <Field label="Fragilidad" value={formatFragility(encomienda.fragilidad)} />
          <Field
            label="Fecha creacion"
            value={formatOptionalDate(encomienda.fecha_creacion || encomienda.created_at)}
          />
          <Field
            label="Ultima actualizacion"
            value={formatOptionalDate(encomienda.fecha_actualizacion || encomienda.updated_at)}
          />
        </dl>
      </Card>
    </div>
  );
}

export default EncomiendaSummary;

function formatFragility(value) {
  const labels = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' };
  return labels[String(value || '').trim().toUpperCase()] || '-';
}

function formatOptionalDate(value) {
  return value ? formatDateTime(value) : '-';
}
