import React from 'react';
import packageIcon from '../../assets/icons/paquete.svg';
import userIcon from '../../assets/icons/cuenta.svg';

const inputClass =
  'min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#31934F] focus:ring-2 focus:ring-green-100';

function Field({ label, name, value, onChange, error, type = 'text', as = 'input', children, ...props }) {
  const Control = as;
  const controlProps = {
    className: inputClass,
    name,
    value,
    onChange,
    ...props,
  };

  if (as === 'input') {
    controlProps.type = type;
  }

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <Control {...controlProps}>
        {children}
      </Control>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function ReniecMessage({ status }) {
  if (!status?.message) return null;

  const toneClass =
    status.tone === 'success'
      ? 'text-[#31934F]'
      : status.tone === 'error'
        ? 'text-red-600'
        : 'text-gray-500';

  return <p className={`text-xs font-semibold ${toneClass}`}>{status.message}</p>;
}

function SectionTitle({ icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#E3EAE1]">
        <img src={icon} alt="" className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-black text-[#1F2937]">{title}</h2>
    </div>
  );
}

function PersonFields({ prefix, form, errors, onChange, onReniecLookup, reniecStatus }) {
  const label = prefix === 'remitente' ? 'remitente' : 'destinatario';

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Field
        as="select"
        label="Tipo de documento"
        name={`${prefix}_tipo_documento`}
        value={form[`${prefix}_tipo_documento`]}
        onChange={onChange}
        error={errors[`${prefix}_tipo_documento`]}
      >
        <option value="DNI">DNI</option>
        <option value="RUC">RUC</option>
        <option value="CE">CE</option>
      </Field>

      <div className="grid gap-1.5">
        <Field
          label="Numero de documento"
          name={`${prefix}_numero_documento`}
          value={form[`${prefix}_numero_documento`]}
          onChange={onChange}
          onBlur={() => onReniecLookup(prefix)}
          error={errors[`${prefix}_numero_documento`]}
          inputMode="numeric"
          maxLength={form[`${prefix}_tipo_documento`] === 'DNI' ? 8 : undefined}
          placeholder={form[`${prefix}_tipo_documento`] === 'DNI' ? '8 digitos' : ''}
        />
        <ReniecMessage status={reniecStatus[prefix]} />
      </div>

      <Field
        label="Nombre completo"
        name={`${prefix}_nombre`}
        value={form[`${prefix}_nombre`]}
        onChange={onChange}
        error={errors[`${prefix}_nombre`]}
        placeholder={`Nombre del ${label}`}
      />

      <Field
        label="Telefono"
        name={`${prefix}_telefono`}
        value={form[`${prefix}_telefono`]}
        onChange={onChange}
        error={errors[`${prefix}_telefono`]}
        inputMode="numeric"
        maxLength={9}
      />

      <Field
        label="Correo electronico"
        name={`${prefix}_correo`}
        value={form[`${prefix}_correo`]}
        onChange={onChange}
        error={errors[`${prefix}_correo`]}
        type="email"
      />

      <Field
        label="Direccion"
        name={`${prefix}_direccion`}
        value={form[`${prefix}_direccion`]}
        onChange={onChange}
        error={errors[`${prefix}_direccion`]}
      />
    </div>
  );
}

function ShipmentFormStep({ form, errors, reniecStatus, onChange, onReniecLookup, onSubmit, onCancel }) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={userIcon} title="Quien envia?" />
          <PersonFields
            prefix="remitente"
            form={form}
            errors={errors}
            onChange={onChange}
            onReniecLookup={onReniecLookup}
            reniecStatus={reniecStatus}
          />
        </section>

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle icon={userIcon} title="Quien recibe?" />
          <PersonFields
            prefix="destinatario"
            form={form}
            errors={errors}
            onChange={onChange}
            onReniecLookup={onReniecLookup}
            reniecStatus={reniecStatus}
          />
        </section>
      </div>

      <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={packageIcon} title="Datos de la encomienda" />
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Origen" name="origen" value={form.origen} onChange={onChange} error={errors.origen} />
          <Field label="Destino" name="destino" value={form.destino} onChange={onChange} error={errors.destino} />
          <Field as="select" label="Tipo de contenido" name="tipo_contenido" value={form.tipo_contenido} onChange={onChange} error={errors.tipo_contenido}>
            <option value="">Seleccionar</option>
            <option value="DOCUMENTOS">Documentos</option>
            <option value="ROPA">Ropa</option>
            <option value="ELECTRONICOS">Electronicos</option>
            <option value="ALIMENTOS">Alimentos</option>
            <option value="OTROS">Otros</option>
          </Field>
          <Field as="select" label="Fragilidad" name="fragilidad" value={form.fragilidad} onChange={onChange} error={errors.fragilidad}>
            <option value="">Seleccionar</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </Field>
          <Field label="Peso total (kg)" name="peso_kg" inputMode="decimal" value={form.peso_kg} onChange={onChange} error={errors.peso_kg} />
          <Field label="Largo (cm)" name="largo_cm" inputMode="decimal" value={form.largo_cm} onChange={onChange} error={errors.largo_cm} />
          <Field label="Ancho (cm)" name="ancho_cm" inputMode="decimal" value={form.ancho_cm} onChange={onChange} error={errors.ancho_cm} />
          <Field label="Alto (cm)" name="alto_cm" inputMode="decimal" value={form.alto_cm} onChange={onChange} error={errors.alto_cm} />
          <label className="grid gap-1.5 md:col-span-2 xl:col-span-4">
            <span className="text-sm font-bold text-gray-700">Descripcion</span>
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              placeholder="Describe brevemente el contenido de la encomienda"
            />
            {errors.descripcion && <span className="text-xs font-semibold text-red-600">{errors.descripcion}</span>}
          </label>
        </div>
      </section>

      {errors.general && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{errors.general}</div>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="min-h-12 rounded-md border border-gray-300 px-6 text-sm font-black text-gray-700 transition hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" className="min-h-12 rounded-md bg-[#31934F] px-7 text-sm font-black text-white shadow-sm transition hover:bg-[#3F6845]">
          Continuar
        </button>
      </div>
    </form>
  );
}

export default ShipmentFormStep;
