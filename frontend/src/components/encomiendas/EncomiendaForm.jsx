import React from 'react';
import Alert from '../common/Alert.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { consultarDni } from '../../services/reniecService.js';
import { ESTADOS_ENCOMIENDA } from '../../utils/encomiendas.js';
import { extractNombreFromReniecResponse } from '../../utils/reniec.js';

function DocumentTypeSelect({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-green-100"
      >
        <option>DNI</option>
        <option>RUC</option>
      </select>
    </label>
  );
}

function ReniecStatus({ status }) {
  if (!status?.message) return null;
  return (
    <p className={`mt-1 text-xs ${status.tone === 'error' ? 'text-red-600' : status.tone === 'success' ? 'text-green-700' : 'text-gray-500'}`}>
      {status.message}
    </p>
  );
}

function EncomiendaForm({ form, onChange, onSubmit, loading = false, mode = 'create', codigoEncomienda = '' }) {
  const [reniecStatus, setReniecStatus] = React.useState({
    remitente: null,
    destinatario: null,
  });

  const updateFieldValue = (name, value) => {
    onChange({ target: { name, value } });
  };

  const handleReniecLookup = async (role) => {
    const typeField = `${role}_tipo_documento`;
    const documentField = `${role}_numero_documento`;
    const nameField = `${role}_nombre`;
    const dni = form[documentField];

    if (form[typeField] !== 'DNI' || !/^\d{8}$/.test(dni || '')) {
      return;
    }

    try {
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'info', message: 'Consultando RENIEC...' },
      }));
      const data = await consultarDni(dni);
      const nombre = extractNombreFromReniecResponse(data);

      if (!nombre) {
        setReniecStatus((current) => ({
          ...current,
          [role]: { tone: 'error', message: 'No se encontro informacion para este DNI.' },
        }));
        return;
      }

      updateFieldValue(nameField, nombre);
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'success', message: 'Nombre autocompletado desde RENIEC.' },
      }));
    } catch (error) {
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'error', message: 'No se pudo consultar RENIEC, ingrese el nombre manualmente.' },
      }));
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {codigoEncomienda && (
        <Alert tone="info">
          Codigo de encomienda: <strong>{codigoEncomienda}</strong>
        </Alert>
      )}

      <section>
        <h3 className="mb-3 text-base font-semibold text-brand-black">Datos del remitente</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DocumentTypeSelect label="Tipo documento" name="remitente_tipo_documento" value={form.remitente_tipo_documento} onChange={onChange} />
          <div>
            <Input
              label="Numero documento"
              name="remitente_numero_documento"
              value={form.remitente_numero_documento}
              onChange={onChange}
              onBlur={() => handleReniecLookup('remitente')}
              required
            />
            <ReniecStatus status={reniecStatus.remitente} />
          </div>
          <Input label="Nombre completo" name="remitente_nombre" value={form.remitente_nombre} onChange={onChange} required />
          <Input label="Direccion" name="remitente_direccion" value={form.remitente_direccion} onChange={onChange} />
          <Input label="Telefono" name="remitente_telefono" value={form.remitente_telefono} onChange={onChange} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-brand-black">Datos del destinatario</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DocumentTypeSelect label="Tipo documento" name="destinatario_tipo_documento" value={form.destinatario_tipo_documento} onChange={onChange} />
          <div>
            <Input
              label="Numero documento"
              name="destinatario_numero_documento"
              value={form.destinatario_numero_documento}
              onChange={onChange}
              onBlur={() => handleReniecLookup('destinatario')}
            />
            <ReniecStatus status={reniecStatus.destinatario} />
          </div>
          <Input label="Nombre completo" name="destinatario_nombre" value={form.destinatario_nombre} onChange={onChange} required />
          <Input label="Direccion" name="destinatario_direccion" value={form.destinatario_direccion} onChange={onChange} />
          <Input label="Telefono" name="destinatario_telefono" value={form.destinatario_telefono} onChange={onChange} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-brand-black">Datos de encomienda</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Origen" name="origen" value={form.origen} onChange={onChange} required />
          <Input label="Destino" name="destino" value={form.destino} onChange={onChange} required />
          <Input label="Descripcion" name="descripcion" value={form.descripcion} onChange={onChange} required />
          <Input label="Peso (kg)" name="peso_kg" type="number" min="0.1" step="0.1" value={form.peso_kg} onChange={onChange} required />
          <Input label="Largo (cm)" name="largo_cm" type="number" min="0.1" step="0.1" value={form.largo_cm} onChange={onChange} required />
          <Input label="Ancho (cm)" name="ancho_cm" type="number" min="0.1" step="0.1" value={form.ancho_cm} onChange={onChange} required />
          <Input label="Alto (cm)" name="alto_cm" type="number" min="0.1" step="0.1" value={form.alto_cm} onChange={onChange} required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Fragilidad</span>
            <select
              name="fragilidad"
              value={form.fragilidad}
              onChange={onChange}
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-green-100"
            >
              <option>BAJA</option>
              <option>MEDIA</option>
              <option>ALTA</option>
            </select>
          </label>
          {mode === 'edit' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Estado</span>
              <select
                name="estado"
                value={form.estado}
                onChange={onChange}
                className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-green-100"
              >
                {ESTADOS_ENCOMIENDA.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Registrar encomienda'}
      </Button>
    </form>
  );
}

export default EncomiendaForm;
