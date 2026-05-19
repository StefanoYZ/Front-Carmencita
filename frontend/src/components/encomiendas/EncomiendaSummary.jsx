import React from 'react';
import Badge from '../common/Badge.jsx';
import Card from '../common/Card.jsx';
import { getDimensions } from '../../utils/encomiendas.js';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-brand-black">{value || '-'}</dd>
    </div>
  );
}

function EncomiendaSummary({ encomienda }) {
  if (!encomienda) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <h3 className="text-base font-semibold text-brand-black">Remitente</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <Field label="Documento" value={`${encomienda.remitente_tipo_documento || '-'} ${encomienda.remitente_numero_documento || ''}`} />
          <Field label="Nombre" value={encomienda.remitente_nombre} />
          <Field label="Direccion" value={encomienda.remitente_direccion} />
          <Field label="Telefono" value={encomienda.remitente_telefono} />
        </dl>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-brand-black">Destinatario</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <Field label="Documento" value={`${encomienda.destinatario_tipo_documento || '-'} ${encomienda.destinatario_numero_documento || ''}`} />
          <Field label="Nombre" value={encomienda.destinatario_nombre} />
          <Field label="Direccion" value={encomienda.destinatario_direccion} />
          <Field label="Telefono" value={encomienda.destinatario_telefono} />
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-brand-black">Paquete</h3>
          <Badge tone="amber">{encomienda.estado || 'SIN ESTADO'}</Badge>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <Field label="Codigo" value={formatShipmentCode(encomienda.codigo_encomienda)} />
          <Field label="Ruta" value={`${encomienda.origen || '-'} -> ${encomienda.destino || '-'}`} />
          <Field label="Descripcion" value={encomienda.descripcion} />
          <Field label="Peso" value={encomienda.peso_kg ? `${encomienda.peso_kg} kg` : '-'} />
          <Field label="Dimensiones" value={getDimensions(encomienda)} />
          <Field label="Fragilidad" value={encomienda.fragilidad} />
          <Field label="Fecha creacion" value={encomienda.fecha_creacion || encomienda.created_at} />
          <Field label="Ultima actualizacion" value={encomienda.fecha_actualizacion || encomienda.updated_at} />
        </dl>
      </Card>
    </div>
  );
}

export default EncomiendaSummary;
