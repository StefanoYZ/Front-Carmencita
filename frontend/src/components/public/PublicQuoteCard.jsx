import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC_QUOTE_STORAGE_KEY, quoteEstimateFromPublicQuote, writeSessionJSON } from '../../utils/publicShipment.js';
import { getDestinos } from '../../services/destinosService.js';
import locationIcon from '../../assets/icons/marcador-de-posicion.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

const greenPanel = 'rounded-lg bg-[#3C5940] p-4 shadow-[0_14px_28px_rgba(33,37,41,0.14)] ring-1 ring-[#A3CF84]/20';
const selectClass =
  'min-h-11 w-full min-w-0 rounded-md border border-transparent bg-white px-3 text-sm font-bold text-[#212529] shadow-sm outline-none transition hover:border-[#A3CF84] focus:border-[#A3CF84] focus:ring-2 focus:ring-[#A3CF84]';
const inputClass =
  'min-h-11 w-full min-w-0 rounded-md border border-[#A3CF84]/60 bg-white px-3 text-sm font-semibold text-[#212529] shadow-sm outline-none transition placeholder:text-[#6C757D]/70 hover:border-[#28A745]/60 focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]';

const fallbackDestinations = [
  'Trujillo',
  'Shorey',
  'Huayatan',
  'Santiago de Chuco',
  'Chacomas',
  'Cachicadan',
  'Santa Cruz de Chuca',
  'Cochapamba',
  'Algallama',
  'Villacruz',
  'Las Manzanas',
  'Angasmarca',
];

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

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="px-1 text-xs font-bold text-[#F8F9FA]">{label}</span>
      <select className={selectClass} name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RouteConnector() {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-[#A3CF84] bg-[#F8F9FA] p-4">
      <div className="relative mx-auto flex h-16 w-full max-w-[360px] items-center justify-center">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#A3CF84]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-[#28A745] shadow-sm ring-1 ring-[#A3CF84]/70">
          &rarr;
        </span>
      </div>
      <div className="mt-2">
        <p className="mb-3 text-base font-black text-[#212529]">Puntos intermedios</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {['Huamachuco', 'Quiruvilca', 'Santiago de Chuco', 'Angasmarca'].map((point, index) => (
            <div key={`${point}-${index}`} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#3C5940]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#28A745]">
                <img src={checkIcon} alt="" className="h-3 w-3 brightness-0 invert" />
              </span>
              <span className="truncate">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicQuoteCard() {
  const [form, setForm] = useState({
    origen: 'Trujillo',
    destino: 'Angasmarca',
    tipo: 'Sobres',
    peso: '',
    largo: '',
    ancho: '',
    alto: '',
    fragilidad: '',
  });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState(fallbackDestinations);

  const isComplete = useMemo(
    () => form.origen && form.destino && form.tipo && form.peso && form.largo && form.ancho && form.alto && form.fragilidad,
    [form],
  );

  useEffect(() => {
    async function loadDestinations() {
      try {
        const result = await getDestinos();
        const names = result.map((destino) => destino.nombre || destino.name).filter(Boolean);
        setDestinations(names.length > 0 ? names : fallbackDestinations);
      } catch (loadError) {
        setDestinations(fallbackDestinations);
      }
    }

    loadDestinations();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setQuote(null);
    setError('');
  };

  const calculateQuote = (event) => {
    event.preventDefault();

    if (!isComplete) {
      setError('Completa los detalles del envio para calcular el monto.');
      return;
    }

    const weight = Number(form.peso);
    const volume = Number(form.largo) * Number(form.ancho) * Number(form.alto);

    if ([weight, volume].some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('Ingresa medidas y peso mayores a cero.');
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
    <article id="destinos" className="w-full min-w-0 overflow-hidden rounded-lg border border-[#E4ECE2] bg-white p-5 shadow-[0_18px_40px_rgba(33,37,41,0.09)] sm:p-6 lg:p-7">
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
            <SelectField label="Departamento" value="La Libertad" options={['La Libertad']} onChange={() => {}} />
            <SelectField label="Provincia" value="Trujillo" options={['Trujillo', 'Santiago de Chuco']} onChange={() => {}} />
            <SelectField label="Distrito" name="origen" value={form.origen} options={destinations} onChange={updateField} />
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#212529]">2. Destino</h3>
          </div>
          <div className={`${greenPanel} grid gap-4`}>
            <SelectField label="Departamento" value="La Libertad" options={['La Libertad']} onChange={() => {}} />
            <SelectField label="Provincia" value="Santiago de Chuco" options={['Santiago de Chuco', 'Trujillo']} onChange={() => {}} />
            <SelectField label="Distrito" name="destino" value={form.destino} options={destinations} onChange={updateField} />
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

                <label className="mt-4 grid gap-2">
                  <span className="text-sm font-black text-[#3C5940]">Fragilidad</span>
                  <select className={inputClass} name="fragilidad" value={form.fragilidad} onChange={updateField}>
                    <option value="">Seleccionar</option>
                    <option value="No fragil">No fragil</option>
                    <option value="Fragil">Fragil</option>
                  </select>
                </label>
              </div>

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
            </div>

            {error && <p className="mt-3 rounded-md border border-[#3C5940]/30 bg-white px-3 py-2 text-sm font-semibold text-[#212529]">{error}</p>}

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
