import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC_QUOTE_STORAGE_KEY, quoteEstimateFromPublicQuote, writeSessionJSON } from '../../utils/publicShipment.js';
import { getDestinos } from '../../services/destinosService.js';
import {
  DEFAULT_LOCATION_NAMES,
  LOCATION_PROVINCES,
  getLocationOptionsByProvince,
} from '../../utils/locationHierarchy.js';
import locationIcon from '../../assets/icons/marcador-de-posicion.svg';
import packageIcon from '../../assets/icons/paquete.svg';

const greenPanel = 'rounded-lg bg-[#3C5940] p-4 shadow-[0_14px_28px_rgba(33,37,41,0.14)] ring-1 ring-[#A3CF84]/20';
const selectClass =
  'h-11 w-full min-w-0 rounded-md border border-transparent bg-white px-3 py-0 text-sm font-bold text-[#212529] shadow-sm outline-none transition hover:border-[#A3CF84] focus:border-[#A3CF84] focus:ring-2 focus:ring-[#A3CF84]';
const inputClass =
  'h-11 w-full min-w-0 rounded-md border border-[#A3CF84]/60 bg-white px-3 py-0 text-sm font-semibold text-[#212529] shadow-sm outline-none transition placeholder:text-[#6C757D]/70 hover:border-[#28A745]/60 focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]';

function GreenIcon({ src, className = 'h-7 w-7' }) {
  return (
    <img
      src={src}
      alt=""
      className={`object-contain ${className}`}
      style={{ filter: 'invert(42%) sepia(70%) saturate(555%) hue-rotate(88deg) brightness(91%) contrast(86%)' }}
    />
  );
}

function SelectField({ label, name, value, onChange, options, placeholder = '' }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="px-1 text-xs font-bold text-[#F8F9FA]">{label}</span>
      <select className={selectClass} name={name} value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
          );
        })}
      </select>
    </label>
  );
}

function RouteConnector() {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-[#A3CF84] bg-[#F8F9FA] px-4 py-2">
      <div className="relative mx-auto flex h-14 w-full max-w-[440px] items-center justify-center">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#A3CF84]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-[#28A745] shadow-sm ring-1 ring-[#A3CF84]/70">
          &rarr;
        </span>
      </div>
    </div>
  );
}

function PublicQuoteCard() {
  const [form, setForm] = useState({
    origen: '',
    destino: '',
    tipo: 'Sobres',
    peso: '',
    largo: '',
    ancho: '',
    alto: '',
    fragilidad: '',
  });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState(DEFAULT_LOCATION_NAMES);
  const [originProvince, setOriginProvince] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const originOptions = useMemo(
    () => getLocationOptionsByProvince(destinations, originProvince),
    [destinations, originProvince],
  );
  const destinationOptions = useMemo(
    () => getLocationOptionsByProvince(destinations, destinationProvince),
    [destinations, destinationProvince],
  );
  const isEnvelope = form.tipo === 'Sobres';
  const hasDifferentRoute = Boolean(form.origen && form.destino && form.origen !== form.destino);

  const isComplete = useMemo(
    () => hasDifferentRoute
      && form.tipo
      && form.peso
      && (isEnvelope || form.fragilidad)
      && (isEnvelope || (form.largo && form.ancho && form.alto)),
    [form, hasDifferentRoute, isEnvelope],
  );

  useEffect(() => {
    async function loadDestinations() {
      try {
        const result = await getDestinos();
        const names = result.map((destino) => destino.nombre || destino.name).filter(Boolean);
        setDestinations(names.length > 0 ? names : DEFAULT_LOCATION_NAMES);
      } catch (loadError) {
        setDestinations(DEFAULT_LOCATION_NAMES);
      }
    }

    loadDestinations();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    const nextRoute = { ...form, [name]: value };
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'tipo' && value === 'Sobres'
        ? { largo: '', ancho: '', alto: '', fragilidad: '' }
        : {}),
    }));
    setQuote(null);
    setError(
      nextRoute.origen && nextRoute.destino && nextRoute.origen === nextRoute.destino
        ? 'El origen y el destino deben ser diferentes.'
        : '',
    );
  };

  const updateProvince = (field, setProvince) => (event) => {
    const province = event.target.value;
    const options = getLocationOptionsByProvince(destinations, province);
    const selectedLocation = options[0]?.value || '';
    setProvince(province);
    setForm((current) => ({
      ...current,
      [field]: selectedLocation,
    }));
    setQuote(null);
    const otherLocation = field === 'origen' ? form.destino : form.origen;
    setError(
      selectedLocation && otherLocation && selectedLocation === otherLocation
        ? 'El origen y el destino deben ser diferentes.'
        : '',
    );
  };

  const calculateQuote = (event) => {
    event.preventDefault();

    if (form.origen && form.destino && form.origen === form.destino) {
      setError('El origen y el destino deben ser diferentes.');
      return;
    }

    if (!isComplete) {
      setError('Completa los detalles del envio para calcular el monto.');
      return;
    }

    const weight = Number(form.peso);
    const volume = isEnvelope ? 0 : Number(form.largo) * Number(form.ancho) * Number(form.alto);

    if (!Number.isFinite(weight) || weight <= 0 || (!isEnvelope && (!Number.isFinite(volume) || volume <= 0))) {
      setError(isEnvelope ? 'Ingresa un peso mayor a cero.' : 'Ingresa medidas y peso mayores a cero.');
      return;
    }

    const estimate = quoteEstimateFromPublicQuote(form);
    const fallback = Math.max((form.tipo === 'Sobres' ? 8 : 12) + weight * 2.4 + volume / 6500, 10);
    setQuote(Number((estimate.total || fallback).toFixed(2)));
  };

  const saveQuoteForRegistration = () => {
    writeSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, {
      ...form,
      estimatedTotal: quote,
    });
  };

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-lg border border-[#E4ECE2] bg-white p-5 shadow-[0_18px_40px_rgba(33,37,41,0.09)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[#28A745]">Ruta referencial</p>
          <h2 className="mt-1 text-2xl font-black text-[#212529] sm:text-3xl">Cotizador de envios</h2>
        </div>
        <p className="max-w-sm text-sm font-semibold leading-6 text-[#6C757D]">
          Calcula un monto estimado segun el origen y destino seleccionados.
        </p>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#212529]">1. Origen</h3>
          </div>
          <div className={`${greenPanel} grid gap-4`}>
            <SelectField
              label="Provincia"
              value={originProvince}
              options={LOCATION_PROVINCES}
              placeholder="Seleccionar provincia"
              onChange={updateProvince('origen', setOriginProvince)}
            />
            {originProvince && (
              <div className="public-progressive-field">
                <SelectField label="Distrito" name="origen" value={form.origen} options={originOptions} onChange={updateField} />
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#212529]">2. Destino</h3>
          </div>
          <div className={`${greenPanel} grid gap-4`}>
            <SelectField
              label="Provincia"
              value={destinationProvince}
              options={LOCATION_PROVINCES}
              placeholder="Seleccionar provincia"
              onChange={updateProvince('destino', setDestinationProvince)}
            />
            {destinationProvince && (
              <div className="public-progressive-field">
                <SelectField label="Distrito" name="destino" value={form.destino} options={destinationOptions} onChange={updateField} />
              </div>
            )}
          </div>
        </section>

        <div className="min-w-0 lg:col-span-2">
          <RouteConnector />
        </div>

        <section className="min-w-0 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={packageIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#212529]">3. Detalles del envio</h3>
          </div>
          <form className="min-w-0 rounded-lg border border-[#A3CF84] bg-[#E4ECE2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_24px_rgba(60,89,64,0.10)] sm:p-5" onSubmit={calculateQuote}>
            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm font-black text-[#3C5940]">Tipo de envio</p>
                <div className="mt-3 grid gap-2">
                  {['Sobres', 'Paquetes'].map((type) => {
                    const selected = form.tipo === type;
                    return (
                      <label
                        key={type}
                        className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                          selected
                            ? 'border-[#28A745] bg-white text-[#212529] shadow-sm'
                            : 'border-[#A3CF84]/70 bg-white/80 text-[#3C5940] hover:border-[#28A745]'
                        }`}
                      >
                        <input
                          checked={selected}
                          className="h-4 w-4 accent-[#28A745]"
                          name="tipo"
                          type="radio"
                          value={type}
                          onChange={updateField}
                        />
                        {type}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[#3C5940]">Peso total</span>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_64px] overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-[#A3CF84]/50">
                    <input
                      className="min-h-11 min-w-0 border-0 px-3 text-sm font-semibold text-[#212529] outline-none placeholder:text-[#6C757D]/70 focus:ring-2 focus:ring-inset focus:ring-[#A3CF84]"
                      min="0"
                      name="peso"
                      placeholder="Ingrese peso"
                      step="0.1"
                      type="number"
                      value={form.peso}
                      onChange={updateField}
                    />
                    <span className="flex items-center justify-center border-l border-[#A3CF84]/60 bg-[#F8F9FA] text-sm font-bold text-[#3C5940]">Kg</span>
                  </div>
                </label>

                {!isEnvelope && (
                  <label className="mt-4 grid gap-2">
                    <span className="text-sm font-black text-[#3C5940]">Fragilidad</span>
                    <select className={inputClass} name="fragilidad" value={form.fragilidad} onChange={updateField}>
                      <option value="">Seleccionar</option>
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </label>
                )}
              </div>

              {!isEnvelope && (
                <div className="min-w-0 lg:col-span-2">
                  <p className="text-sm font-black text-[#3C5940]">Medidas del paquete (cm)</p>
                  <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      ['largo', 'Largo'],
                      ['ancho', 'Ancho'],
                      ['alto', 'Alto'],
                    ].map(([name, label]) => (
                      <label key={name} className="grid min-w-0 gap-1.5">
                        <span className="text-sm font-bold text-[#3C5940]">{label}</span>
                        <input className={inputClass} min="0" name={name} step="0.1" type="number" value={form[name]} onChange={updateField} />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

            <button
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#28A745] px-6 text-base font-black text-white shadow-[0_12px_24px_rgba(40,167,69,0.28)] transition hover:-translate-y-0.5 hover:bg-[#3C5940] hover:shadow-[0_14px_28px_rgba(60,89,64,0.24)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-white disabled:text-[#6C757D] disabled:shadow-none disabled:ring-1 disabled:ring-[#A3CF84] sm:max-w-[180px]"
              type="submit"
              disabled={!isComplete}
            >
              COTIZAR
            </button>
          </form>
        </section>
      </div>

      <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
        <div className="rounded-lg bg-[#E4ECE2] px-5 py-4 text-center ring-1 ring-[#A3CF84]/45">
          <p className="text-sm font-bold text-[#3C5940]">Tiempo estimado de entrega</p>
          <p className="text-lg font-black text-[#212529]">12 a 24 horas</p>
        </div>

        <div className="min-w-0 rounded-lg bg-[#3C5940] px-5 py-4 text-white shadow-[0_12px_24px_rgba(60,89,64,0.16)]">
          <p className="text-sm font-bold text-[#F8F9FA]">Precio estimado</p>
          <p className="mt-1 break-words text-3xl font-black sm:text-4xl">S/ {quote ? quote.toFixed(2) : '0.00'}</p>
        </div>

        {quote && (
          <Link
            to="/registrar-envio"
            state={{
              quote: {
                ...form,
                estimatedTotal: quote,
              },
            }}
            onClick={saveQuoteForRegistration}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#28A745] px-6 text-base font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3C5940] xl:w-auto"
          >
            <img src={packageIcon} alt="" className="h-7 w-7 brightness-0 invert" />
            Registro de envio
          </Link>
        )}
      </div>
    </article>
  );
}

export default PublicQuoteCard;
