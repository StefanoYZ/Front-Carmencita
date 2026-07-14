import React, { useEffect, useMemo, useState } from 'react';
import PackageBaseSelector from '../common/PackageBaseSelector.jsx';
import FieldAlertBell from '../asistente/FieldAlertBell.jsx';
import useCoherenceWarnings from '../../hooks/useCoherenceWarnings.js';
import packageIcon from '../../assets/icons/paquete.svg';
import userIcon from '../../assets/icons/cuenta.svg';
import {
  LOCATION_PROVINCES,
  getLocationOptionsByProvince,
  getProvinceForLocation,
} from '../../utils/locationHierarchy.js';

const inputClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-0 text-sm font-semibold text-[#212529] shadow-sm outline-none transition placeholder:text-[#6C757D]/60 hover:border-[#A3CF84] focus:border-[#28A745] focus:ring-4 focus:ring-[#A3CF84]/25';

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

function Field({ label, name, value, onChange, error, warning, alertMode = 'chat', type = 'text', as = 'input', required = false, children, ...props }) {
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
    <label className="grid self-start content-start gap-1.5">
      <span className="text-sm font-black text-[#3C5940]">
        {label}{required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </span>
      <div className="relative">
        <Control {...controlProps}>
          {children}
        </Control>
        <FieldAlertBell warning={warning} label={label} mode={alertMode} />
      </div>
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
    <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28A745] to-[#1f6f37] shadow-[0_8px_18px_-8px_rgba(40,167,69,0.65)]">
        <img src={icon} alt="" className="h-5 w-5 brightness-0 invert" />
      </span>
      <h2 className="text-xl font-black text-[#212529]">{title}</h2>
    </div>
  );
}

function PersonFields({ prefix, form, errors, onChange, onReniecLookup, reniecStatus, requiredDocument = false }) {
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
      </Field>

      <div className="grid gap-1.5">
        <Field
          label="Numero de documento"
          required={requiredDocument}
          name={`${prefix}_numero_documento`}
          value={form[`${prefix}_numero_documento`]}
          onChange={onChange}
          onBlur={() => onReniecLookup(prefix)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onReniecLookup(prefix);
            }
          }}
          error={errors[`${prefix}_numero_documento`]}
          inputMode="numeric"
          maxLength={form[`${prefix}_tipo_documento`] === 'DNI' ? 8 : undefined}
          placeholder={form[`${prefix}_tipo_documento`] === 'DNI' ? '8 digitos' : ''}
        />
        <ReniecMessage status={reniecStatus[prefix]} />
      </div>

      <Field
        label="Nombre completo"
        required
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

function LocationField({ label, name, value, onChange, error, options, required = false }) {
  const [province, setProvince] = useState(() => (value ? getProvinceForLocation(value) : ''));
  const districtOptions = useMemo(
    () => getLocationOptionsByProvince(options, province),
    [options, province],
  );

  useEffect(() => {
    if (value) {
      setProvince(getProvinceForLocation(value));
    }
  }, [value]);

  const handleProvinceChange = (event) => {
    const nextProvince = event.target.value;
    const nextOptions = getLocationOptionsByProvince(options, nextProvince);
    setProvince(nextProvince);
    onChange({
      target: {
        name,
        value: nextOptions[0]?.value || '',
      },
    });
  };

  return (
    <fieldset className="grid min-w-0 self-start content-start gap-3">
      <legend className="text-sm font-black text-[#3C5940]">
        {label}{required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </legend>
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-[#6C757D]">Provincia</span>
        <select className={inputClass} value={province} onChange={handleProvinceChange}>
          <option value="">Seleccionar provincia</option>
          {LOCATION_PROVINCES.map((provinceOption) => (
            <option key={provinceOption} value={provinceOption}>{provinceOption}</option>
          ))}
        </select>
      </label>
      {province && (
        <label className="public-progressive-field grid gap-1.5">
          <span className="text-xs font-bold text-[#6C757D]">Distrito</span>
          <select className={inputClass} name={name} value={value} onChange={onChange}>
            <option value="">Seleccionar distrito</option>
            {districtOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

function ShipmentFormStep({ form, errors, reniecStatus, locationOptions = [], onChange, onReniecLookup, onSubmit, onCancel, alertMode = 'chat' }) {
  const isEnvelope = form.tipo_contenido === 'DOCUMENTOS';
  const coherenceWarnings = useCoherenceWarnings({
    tipoContenido: form.tipo_contenido,
    descripcion: form.descripcion,
    pesoKg: form.peso_kg,
    largoCm: form.largo_cm,
    anchoCm: form.ancho_cm,
    altoCm: form.alto_cm,
    fragilidad: form.fragilidad,
    orientacionBase: form.orientacion_base,
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] sm:p-6">
          <SectionTitle icon={userIcon} title="¿Quién envía?" />
          <PersonFields
            prefix="remitente"
            form={form}
            errors={errors}
            onChange={onChange}
            onReniecLookup={onReniecLookup}
            reniecStatus={reniecStatus}
            requiredDocument
          />
        </section>

        <section className="min-w-0 rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] sm:p-6">
          <SectionTitle icon={userIcon} title="¿Quién recibe?" />
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

      <section className="min-w-0 rounded-2xl border border-[#A3CF84]/60 bg-gradient-to-b from-[#F4F8F1] to-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] sm:p-6">
        <SectionTitle icon={packageIcon} title="Datos de la encomienda" />
        <div className="grid min-w-0 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LocationField label="Origen" required name="origen" value={form.origen} onChange={onChange} error={errors.origen} options={locationOptions} />
          <LocationField label="Destino" required name="destino" value={form.destino} onChange={onChange} error={errors.destino} options={locationOptions} />
          <Field as="select" label="Tipo de contenido" required name="tipo_contenido" value={form.tipo_contenido} onChange={onChange} error={errors.tipo_contenido} warning={coherenceWarnings.tipo_contenido} alertMode={alertMode}>
            <option value="">Seleccionar</option>
            <option value="DOCUMENTOS">Documentos</option>
            <option value="ROPA">Ropa</option>
            <option value="ELECTRONICOS">Electronicos</option>
            <option value="ELECTRODOMESTICOS">Electrodomesticos</option>
            <option value="ALIMENTOS">Alimentos</option>
            <option value="OTROS">Otros</option>
          </Field>
          {!isEnvelope && (
            <Field as="select" label="Fragilidad" required name="fragilidad" value={form.fragilidad} onChange={onChange} error={errors.fragilidad}>
              <option value="">Seleccionar</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </Field>
          )}
          <Field label="Peso total (kg)" required name="peso_kg" inputMode="decimal" value={form.peso_kg} onChange={onChange} error={errors.peso_kg} warning={coherenceWarnings.peso_kg} alertMode={alertMode} />
          {!isEnvelope && (
            <>
              <Field label="Largo (cm)" required name="largo_cm" inputMode="decimal" value={form.largo_cm} onChange={onChange} error={errors.largo_cm} warning={coherenceWarnings.largo_cm} alertMode={alertMode} />
              <Field label="Ancho (cm)" required name="ancho_cm" inputMode="decimal" value={form.ancho_cm} onChange={onChange} error={errors.ancho_cm} warning={coherenceWarnings.ancho_cm} alertMode={alertMode} />
              <Field label="Alto (cm)" required name="alto_cm" inputMode="decimal" value={form.alto_cm} onChange={onChange} error={errors.alto_cm} warning={coherenceWarnings.alto_cm} alertMode={alertMode} />
            </>
          )}
          <label className="grid gap-1.5 md:col-span-2 xl:col-span-4">
            <span className="text-sm font-black text-[#3C5940]">Descripcion<span className="text-red-600" aria-hidden="true"> *</span></span>
            <div className="relative">
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
                placeholder="Describe brevemente el contenido de la encomienda"
              />
              <FieldAlertBell warning={coherenceWarnings.descripcion} label="Descripción" mode={alertMode} />
            </div>
            <FieldError>{errors.descripcion}</FieldError>
          </label>
        </div>
        {!isEnvelope && (
          <div className="relative">
            <PackageBaseSelector
              length={form.largo_cm}
              width={form.ancho_cm}
              height={form.alto_cm}
              value={form.orientacion_base}
              error={errors.orientacion_base}
              onChange={(orientation) => onChange({
                target: { name: 'orientacion_base', value: orientation },
              })}
            />
            <FieldAlertBell warning={coherenceWarnings.orientacion_base} label="Cara del paquete" mode={alertMode} />
          </div>
        )}
      </section>

      {errors.general && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-sm">{errors.general}</div>}

      {/* Explicacion del siguiente paso: que hara el boton Continuar. */}
      <p className="mt-4 rounded-md border border-[#A3CF84]/60 bg-[#F4F8F1] px-4 py-3 text-sm font-semibold text-[#3C5940]">
        Siguiente paso: al presionar <strong>Continuar</strong> revisaras el resumen del envio y elegiras
        el metodo de pago para confirmar la encomienda.
      </p>

      <div className="sticky bottom-3 z-20 mt-3 flex flex-col-reverse gap-3 rounded-2xl border border-[#A3CF84]/70 bg-white/90 p-3 shadow-[0_16px_40px_-16px_rgba(33,37,41,0.3)] backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          className="min-h-12 rounded-xl border border-[#A3CF84]/70 bg-white px-6 text-sm font-black text-[#3C5940] shadow-sm transition hover:border-[#28A745] hover:bg-[#F8F9FA]"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" className="min-h-12 rounded-xl bg-gradient-to-b from-[#28A745] to-[#1f8f3a] px-7 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(40,167,69,0.5)] transition hover:-translate-y-0.5 hover:from-[#2fb850] hover:to-[#3C5940]">
          Continuar
        </button>
      </div>
    </form>
  );
}

export default ShipmentFormStep;
