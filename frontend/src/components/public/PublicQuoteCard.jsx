import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC_QUOTE_STORAGE_KEY, quoteEstimateFromPublicQuote, writeSessionJSON } from '../../utils/publicShipment.js';
import locationIcon from '../../assets/icons/marcador-de-posicion.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

const greenPanel = 'rounded-lg bg-[#3F6845] p-4 shadow-sm';
const selectClass =
  'min-h-11 w-full min-w-0 rounded-md border-0 bg-white px-3 text-sm font-bold text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-[#E5E84C]';
const inputClass =
  'min-h-11 w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#31934F] focus:ring-2 focus:ring-green-100';

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

function SelectField({ label, value }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="px-1 text-xs font-bold text-[#F4FAF5]">{label}</span>
      <select className={selectClass} value={value} onChange={() => {}}>
        <option>{value}</option>
      </select>
    </label>
  );
}

function RouteConnector() {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-[#31934F]/30 bg-[#F4FAF5] p-4">
      <div className="relative mx-auto flex h-16 w-full max-w-[360px] items-center justify-center">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#2F9448]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-[#31934F] shadow-sm">
          →
        </span>
      </div>
      <div className="mt-2">
        <p className="mb-3 text-base font-black text-[#1F2937]">Puntos intermedios</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {['Huamachuco', 'Quiruvilca', 'Santiago de Chuco', 'Angasmarca'].map((point, index) => (
            <div key={`${point}-${index}`} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F9448]">
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
    tipo: 'Sobres',
    peso: '',
    largo: '',
    ancho: '',
    alto: '',
    fragilidad: '',
  });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');

  const isComplete = useMemo(
    () => form.tipo && form.peso && form.largo && form.ancho && form.alto && form.fragilidad,
    [form],
  );

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
      origen: 'Trujillo',
      destino: 'Angasmarca',
      estimatedTotal: quote,
    });
  };

  return (
    <article id="destinos" className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-[0_14px_34px_rgba(31,41,55,0.10)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[#31934F]">Ruta referencial</p>
          <h2 className="mt-1 text-2xl font-black text-[#1F2937] sm:text-3xl">Cotizador de envios</h2>
        </div>
        <p className="max-w-sm text-sm font-semibold leading-6 text-gray-600">
          Calcula un monto estimado para Trujillo - Angasmarca.
        </p>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#1F2937]">1. Origen</h3>
          </div>
          <div className={`${greenPanel} grid gap-4`}>
            <SelectField label="Departamento" value="La Libertad" />
            <SelectField label="Provincia" value="Trujillo" />
            <SelectField label="Distrito" value="Trujillo" />
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#1F2937]">2. Destino</h3>
          </div>
          <div className={`${greenPanel} grid gap-4`}>
            <SelectField label="Departamento" value="La Libertad" />
            <SelectField label="Provincia" value="Santiago de Chuco" />
            <SelectField label="Distrito" value="Angasmarca" />
          </div>
        </section>

        <div className="min-w-0 lg:col-span-2">
          <RouteConnector />
        </div>

        <section className="min-w-0 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={packageIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black text-[#1F2937]">3. Detalles del envio</h3>
          </div>
          <form className="min-w-0 rounded-lg border border-gray-200 bg-[#F9FAFB] p-4 shadow-sm sm:p-5" onSubmit={calculateQuote}>
            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-700">Tipo de envio</p>
                <div className="mt-3 grid gap-2">
                  {['Sobres', 'Paquetes'].map((type) => (
                    <label key={type} className="flex min-h-11 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700">
                      <input
                        checked={form.tipo === type}
                        className="h-4 w-4 accent-[#2F9448]"
                        name="tipo"
                        type="radio"
                        value={type}
                        onChange={updateField}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-gray-700">Peso total</span>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_64px] overflow-hidden rounded-md bg-white shadow-sm">
                    <input
                      className="min-h-11 min-w-0 border border-gray-200 px-3 text-sm outline-none focus:border-[#2F9448]"
                      min="0"
                      name="peso"
                      placeholder="Ingrese peso"
                      step="0.1"
                      type="number"
                      value={form.peso}
                      onChange={updateField}
                    />
                    <span className="flex items-center justify-center border border-l-0 border-gray-200 text-sm font-bold text-gray-600">Kg</span>
                  </div>
                </label>

                <label className="mt-4 grid gap-2">
                  <span className="text-sm font-bold text-gray-700">Fragilidad</span>
                  <select className={inputClass} name="fragilidad" value={form.fragilidad} onChange={updateField}>
                    <option value="">Seleccionar</option>
                    <option value="No fragil">No fragil</option>
                    <option value="Fragil">Fragil</option>
                  </select>
                </label>
              </div>

              <div className="min-w-0 lg:col-span-2">
                <p className="text-sm font-bold text-gray-700">Medidas del paquete (cm)</p>
                <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    ['largo', 'Largo'],
                    ['ancho', 'Ancho'],
                    ['alto', 'Alto'],
                  ].map(([name, label]) => (
                    <label key={name} className="grid min-w-0 gap-1.5">
                      <span className="text-sm font-semibold text-gray-600">{label}</span>
                      <input className={inputClass} min="0" name={name} step="0.1" type="number" value={form[name]} onChange={updateField} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{error}</p>}

            <button
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#31934F] px-6 text-base font-black text-white transition hover:bg-[#3F6845] disabled:cursor-not-allowed disabled:bg-gray-300 sm:max-w-[180px]"
              type="submit"
              disabled={!isComplete}
            >
              COTIZAR
            </button>
          </form>
        </section>
      </div>

      <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
        <div className="rounded-lg bg-[#E4ECE2] px-5 py-4 text-center">
          <p className="text-sm font-bold text-[#356B3F]">Tiempo estimado de entrega</p>
          <p className="text-lg font-black text-black">12 a 24 horas</p>
        </div>

        <div className="min-w-0 rounded-lg bg-[#3F6845] px-5 py-4 text-white">
          <p className="text-sm font-bold text-[#E3EAE1]">Precio estimado</p>
          <p className="mt-1 break-words text-3xl font-black sm:text-4xl">S/ {quote ? quote.toFixed(2) : '0.00'}</p>
        </div>

        {quote && (
          <Link
            to="/registrar-envio"
            state={{
              quote: {
                ...form,
                origen: 'Trujillo',
                destino: 'Angasmarca',
                estimatedTotal: quote,
              },
            }}
            onClick={saveQuoteForRegistration}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#31934F] px-6 text-base font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-[#3F6845] xl:w-auto"
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
