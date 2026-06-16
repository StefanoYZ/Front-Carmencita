import React from 'react';
import Alert from '../common/Alert.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import LocationInput from '../common/LocationInput.jsx';
import { getClienteByDni } from '../../services/clientes.service.js';
import { getDestinos } from '../../services/destinosService.js';
import { consultarDni } from '../../services/reniecService.js';
import { ESTADOS_ENCOMIENDA } from '../../utils/encomiendas.js';
import { extractNombreFromReniecResponse, normalizeLocalClient } from '../../utils/reniec.js';

function DocumentTypeSelect({ label, name, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-black">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
      >
        <option>DNI</option>
        <option>RUC</option>
      </select>
      {error && <span className="mt-1 block text-xs font-semibold text-brand-dark">{error}</span>}
    </label>
  );
}

function ReniecStatus({ status }) {
  if (!status?.message) return null;
  return (
    <p className={`mt-1 text-xs ${status.tone === 'error' ? 'text-brand-dark' : status.tone === 'success' ? 'text-brand-green' : 'text-brand-gray'}`}>
      {status.message}
    </p>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
        <span className="h-9 w-1 rounded-full bg-brand-green" />
        <h3 className="text-base font-black text-brand-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function EncomiendaForm({ form, errors = {}, onChange, onSubmit, loading = false, mode = 'create', codigoEncomienda = '' }) {
  const [reniecStatus, setReniecStatus] = React.useState({
    remitente: null,
    destinatario: null,
  });
  const [locationOptions, setLocationOptions] = React.useState([]);

  React.useEffect(() => {
    async function loadDestinations() {
      try {
        const destinos = await getDestinos();
        setLocationOptions(destinos.map((destino) => destino.nombre || destino.name).filter(Boolean));
      } catch (error) {
        setLocationOptions(['Trujillo', 'Shorey', 'Huayatan', 'Santiago de Chuco', 'Chacomas', 'Cachicadan', 'Santa Cruz de Chuca', 'Cochapamba', 'Algallama', 'Villacruz', 'Las Manzanas', 'Angasmarca']);
      }
    }

    loadDestinations();
  }, []);

  const updateFieldValue = (name, value) => {
    onChange({ target: { name, value } });
  };

  const updatePersonFromLocalClient = (role, client) => {
    Object.entries({
      [`${role}_nombre`]: client.nombre,
      [`${role}_telefono`]: client.telefono,
      [`${role}_correo`]: client.correo,
      [`${role}_direccion`]: client.direccion,
    }).forEach(([name, value]) => {
      if (value) updateFieldValue(name, value);
    });
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
        [role]: { tone: 'info', message: 'Buscando cliente...' },
      }));
      try {
        const localClient = normalizeLocalClient(await getClienteByDni(dni));
        if (localClient.nombre || localClient.telefono || localClient.correo || localClient.direccion) {
          updatePersonFromLocalClient(role, localClient);
          setReniecStatus((current) => ({
            ...current,
            [role]: { tone: 'success', message: 'Datos autocompletados desde clientes.' },
          }));
          return;
        }
      } catch (clientError) {
        if (clientError?.response?.status !== 404) {
          throw clientError;
        }
      }

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

      <FormSection title="Datos del remitente">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DocumentTypeSelect label="Tipo documento" name="remitente_tipo_documento" value={form.remitente_tipo_documento} onChange={onChange} error={errors.remitente_tipo_documento} />
          <div>
            <Input
              label="Numero documento"
              name="remitente_numero_documento"
              value={form.remitente_numero_documento}
              onChange={onChange}
              onBlur={() => handleReniecLookup('remitente')}
              inputMode="numeric"
              maxLength={form.remitente_tipo_documento === 'DNI' ? 8 : undefined}
              error={errors.remitente_numero_documento}
              required
            />
            <ReniecStatus status={reniecStatus.remitente} />
          </div>
          <Input label="Nombre completo" name="remitente_nombre" value={form.remitente_nombre} onChange={onChange} error={errors.remitente_nombre} required />
          <Input label="Direccion" name="remitente_direccion" value={form.remitente_direccion} onChange={onChange} error={errors.remitente_direccion} />
          <Input label="Telefono" name="remitente_telefono" value={form.remitente_telefono} onChange={onChange} inputMode="numeric" maxLength={9} error={errors.remitente_telefono} />
          <Input label="Correo electronico" name="remitente_correo" value={form.remitente_correo} onChange={onChange} type="email" error={errors.remitente_correo} />
        </div>
      </FormSection>

      <FormSection title="Datos del destinatario">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DocumentTypeSelect label="Tipo documento" name="destinatario_tipo_documento" value={form.destinatario_tipo_documento} onChange={onChange} error={errors.destinatario_tipo_documento} />
          <div>
            <Input
              label="Numero documento"
              name="destinatario_numero_documento"
              value={form.destinatario_numero_documento}
              onChange={onChange}
              onBlur={() => handleReniecLookup('destinatario')}
              inputMode="numeric"
              maxLength={form.destinatario_tipo_documento === 'DNI' ? 8 : undefined}
              error={errors.destinatario_numero_documento}
            />
            <ReniecStatus status={reniecStatus.destinatario} />
          </div>
          <Input label="Nombre completo" name="destinatario_nombre" value={form.destinatario_nombre} onChange={onChange} error={errors.destinatario_nombre} required />
          <Input label="Direccion" name="destinatario_direccion" value={form.destinatario_direccion} onChange={onChange} error={errors.destinatario_direccion} />
          <Input label="Telefono" name="destinatario_telefono" value={form.destinatario_telefono} onChange={onChange} inputMode="numeric" maxLength={9} error={errors.destinatario_telefono} />
          <Input label="Correo electronico" name="destinatario_correo" value={form.destinatario_correo} onChange={onChange} type="email" error={errors.destinatario_correo} />
        </div>
      </FormSection>

      <FormSection title="Datos de encomienda">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <LocationInput label="Origen" name="origen" value={form.origen} onChange={onChange} error={errors.origen} options={locationOptions} required />
          <LocationInput label="Destino" name="destino" value={form.destino} onChange={onChange} error={errors.destino} options={locationOptions} required />
          <Input label="Descripcion" name="descripcion" value={form.descripcion} onChange={onChange} error={errors.descripcion} required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-black">Tipo de contenido</span>
            <select
              name="tipo_contenido"
              value={form.tipo_contenido}
              onChange={onChange}
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
            >
              <option value="">Seleccionar</option>
              <option value="DOCUMENTOS">Documentos</option>
              <option value="ROPA">Ropa</option>
              <option value="ELECTRONICOS">Electronicos</option>
              <option value="ALIMENTOS">Alimentos</option>
              <option value="OTROS">Otros</option>
            </select>
            {errors.tipo_contenido && <span className="mt-1 block text-xs font-semibold text-brand-dark">{errors.tipo_contenido}</span>}
          </label>
          <Input label="Peso (kg)" name="peso_kg" inputMode="decimal" value={form.peso_kg} onChange={onChange} error={errors.peso_kg} required />
          <Input label="Largo (cm)" name="largo_cm" inputMode="decimal" value={form.largo_cm} onChange={onChange} error={errors.largo_cm} required />
          <Input label="Ancho (cm)" name="ancho_cm" inputMode="decimal" value={form.ancho_cm} onChange={onChange} error={errors.ancho_cm} required />
          <Input label="Alto (cm)" name="alto_cm" inputMode="decimal" value={form.alto_cm} onChange={onChange} error={errors.alto_cm} required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-black">Fragilidad</span>
            <select
              name="fragilidad"
              value={form.fragilidad}
              onChange={onChange}
              className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
            >
              <option value="BAJA">No fragil</option>
              <option value="ALTA">Fragil</option>
            </select>
            {errors.fragilidad && <span className="mt-1 block text-xs font-semibold text-brand-dark">{errors.fragilidad}</span>}
          </label>
          {mode === 'edit' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-black">Estado</span>
              <select
                name="estado"
                value={form.estado}
                onChange={onChange}
                className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
              >
                {ESTADOS_ENCOMIENDA.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
              {errors.estado && <span className="mt-1 block text-xs font-semibold text-brand-dark">{errors.estado}</span>}
            </label>
          )}
        </div>
      </FormSection>

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Registrar encomienda'}
      </Button>
    </form>
  );
}

export default EncomiendaForm;
