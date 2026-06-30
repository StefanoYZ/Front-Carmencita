import React from 'react';
import { MapPin, Package, User, UserCheck } from 'lucide-react';
import Card from '../common/Card.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import FragilityBadge from '../common/FragilityBadge.jsx';
import { getDimensions } from '../../utils/encomiendas.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';

function SectionHeader({ icon: Icon, title, accent = 'text-brand-dark', children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-surface ${accent}`} aria-hidden="true">
          <Icon size={18} />
        </span>
        <h3 className="text-base font-black text-brand-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">
      <dt className="shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-gray">{label}</dt>
      <dd className="break-words text-right font-semibold text-brand-black">{children ?? value ?? '-'}</dd>
    </div>
  );
}

function EncomiendaSummary({ encomienda }) {
  if (!encomienda) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <SectionHeader icon={User} title="Remitente" />
        <dl className="mt-2 text-sm">
          <Field label="Documento" value={`${encomienda.remitente_tipo_documento || '-'} ${encomienda.remitente_numero_documento || ''}`.trim()} />
          <Field label="Nombre" value={encomienda.remitente_nombre} />
          <Field label="Direccion" value={encomienda.remitente_direccion} />
          <Field label="Telefono" value={encomienda.remitente_telefono} />
        </dl>
      </Card>

      <Card>
        <SectionHeader icon={UserCheck} title="Destinatario" />
        <dl className="mt-2 text-sm">
          <Field label="Documento" value={`${encomienda.destinatario_tipo_documento || '-'} ${encomienda.destinatario_numero_documento || ''}`.trim()} />
          <Field label="Nombre" value={encomienda.destinatario_nombre} />
          <Field label="Direccion" value={encomienda.destinatario_direccion} />
          <Field label="Telefono" value={encomienda.destinatario_telefono} />
        </dl>
      </Card>

      <Card>
        <SectionHeader icon={Package} title="Paquete" accent="text-brand-green">
          <StatusBadge value={encomienda.estado} />
        </SectionHeader>
        <dl className="mt-2 text-sm">
          <Field label="Codigo">
            <span className="font-black text-brand-black">{formatShipmentCode(encomienda.codigo_encomienda)}</span>
          </Field>
          <Field label="Ruta">
            <span>
              {encomienda.origen || '-'} <span className="text-brand-gray" aria-hidden="true">&rarr;</span> {encomienda.destino || '-'}
            </span>
          </Field>
          <Field label="Descripcion" value={encomienda.descripcion} />
          <Field label="Peso" value={encomienda.peso_kg ? `${encomienda.peso_kg} kg` : '-'} />
          <Field label="Dimensiones" value={getDimensions(encomienda)} />
          <Field label="Fragilidad">
            <FragilityBadge value={encomienda.fragilidad} />
          </Field>
          <Field label="Fecha creacion" value={formatOptionalDate(encomienda.fecha_creacion || encomienda.created_at)} />
          <Field label="Ultima actualizacion" value={formatOptionalDate(encomienda.fecha_actualizacion || encomienda.updated_at)} />
        </dl>
      </Card>
    </div>
  );
}

export default EncomiendaSummary;

function formatOptionalDate(value) {
  return value ? formatDateTime(value) : '-';
}
