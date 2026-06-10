import React from 'react';
import packageIcon from '../../assets/icons/paquete.svg';
import userIcon from '../../assets/icons/cuenta.svg';

const inputClass =
  'min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 py-2 text-sm font-semibold text-[#212529] shadow-sm outline-none transition placeholder:text-[#6C757D]/70 hover:border-[#28A745] focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]';

function FieldError({ children }) {
  return (
    <span
      className={`block min-h-4 text-xs font-semibold leading-4 ${children ? 'text-red-600' : 'text-transparent'}`}
      aria-hidden={!children}
      aria-live={children ? 'polite' : undefined}
    >
      {children || ''}
    </span>
  );
}

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
      <span className="text-sm font-black text-[#3C5940]">{label}</span>
      <Control {...controlProps}>
        {children}
      </Control>
      <FieldError>{error}</FieldError>
    </label>
  );
}

function ReniecMessage({ status }) {
  if (!status?.message) return null;

  const toneClass =
    status.tone === 'success'
      ? 'text-[#28A745]'
      : status.tone === 'error'
        ? 'text-red-600'
        : 'text-[#6C757D]';

  return <p className={`text-xs font-semibold ${toneClass}`}>{status.message}</p>;
}

function SectionTitle({ icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[#A3CF84]/45 pb-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#E4ECE2] ring-1 ring-[#A3CF84]/45">
        <img src={icon} alt="" className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-black text-[#212529]">{title}</h2>
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

function LocationField({ label, name, value, onChange, error, options }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-black text-[#3C5940]">{label}</span>
      <select
        className={inputClass}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError>{error}</FieldError>
    </label>
  );
}

function ShipmentFormStep({ form, errors, reniecStatus, locationOptions = [], onChange, onReniecLookup, onSubmit, onCancel }) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)] sm:p-6">
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

        <section className="min-w-0 rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)] sm:p-6">
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

      <section className="min-w-0 rounded-lg border border-[#A3CF84] bg-[#E4ECE2] p-5 shadow-[0_18px_42px_rgba(60,89,64,0.16)] ring-1 ring-white/70 sm:p-6">
        <SectionTitle icon={packageIcon} title="Datos de la encomienda" />
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LocationField label="Origen" name="origen" value={form.origen} onChange={onChange} error={errors.origen} options={locationOptions} />
          <LocationField label="Destino" name="destino" value={form.destino} onChange={onChange} error={errors.destino} options={locationOptions} />
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
            <option value="BAJA">No fragil</option>
            <option value="ALTA">Fragil</option>
          </Field>
          <Field label="Peso total (kg)" name="peso_kg" inputMode="decimal" value={form.peso_kg} onChange={onChange} error={errors.peso_kg} />
          <Field label="Largo (cm)" name="largo_cm" inputMode="decimal" value={form.largo_cm} onChange={onChange} error={errors.largo_cm} />
          <Field label="Ancho (cm)" name="ancho_cm" inputMode="decimal" value={form.ancho_cm} onChange={onChange} error={errors.ancho_cm} />
          <Field label="Alto (cm)" name="alto_cm" inputMode="decimal" value={form.alto_cm} onChange={onChange} error={errors.alto_cm} />
          <label className="grid gap-1.5 md:col-span-2 xl:col-span-4">
            <span className="text-sm font-black text-[#3C5940]">Descripcion</span>
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              placeholder="Describe brevemente el contenido de la encomienda"
            />
            <FieldError>{errors.descripcion}</FieldError>
          </label>
        </div>
      </section>

      {errors.general && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-sm">{errors.general}</div>}

      <div className="sticky bottom-3 z-20 mt-6 flex flex-col-reverse gap-3 rounded-lg border border-[#A3CF84]/70 bg-white/95 p-3 shadow-[0_16px_40px_rgba(33,37,41,0.18)] backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          className="min-h-12 rounded-md border border-[#A3CF84]/70 bg-white px-6 text-sm font-black text-[#3C5940] shadow-sm transition hover:border-[#28A745] hover:bg-[#F8F9FA]"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" className="min-h-12 rounded-md bg-[#28A745] px-7 text-sm font-black text-white shadow-[0_12px_24px_rgba(40,167,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#3C5940]">
          Continuar
        </button>
      </div>
    </form>
  );
}

export default ShipmentFormStep;
