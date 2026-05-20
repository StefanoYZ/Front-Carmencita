import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import locationIcon from '../../assets/icons/marcador-de-posicion.svg';
import truckIcon from '../../assets/icons/camion.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

const greenPanel = 'rounded-md bg-[#2F9448] p-4 shadow-lg shadow-gray-400/30';
const selectClass = 'min-h-12 w-full rounded-md border-0 bg-white px-3 text-sm font-black text-gray-900 shadow-sm outline-none';
const inputClass = 'min-h-11 w-full rounded-md border border-gray-100 bg-white px-3 text-sm shadow-md shadow-gray-300/50 outline-none focus:border-[#2F9448] focus:ring-2 focus:ring-green-100';

function GreenIcon({ src, className = 'h-7 w-7' }) {
  return (
    <span
      className={`block bg-[#2F9448] ${className}`}
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

function SelectField({ label, value }) {
  return (
    <label className="grid gap-1">
      <span className="px-1 text-[10px] font-semibold text-gray-500">{label}</span>
      <select className={selectClass} value={value} onChange={() => {}}>
        <option>{value}</option>
      </select>
    </label>
  );
}

function RouteConnector() {
  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center gap-4 py-4">
      <div className="relative flex h-20 w-full max-w-[210px] items-center justify-center">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#2F9448]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <GreenIcon src={truckIcon} className="h-8 w-8" />
        </span>
      </div>
      <div>
        <p className="mb-3 text-lg font-black text-black">Puntos intermedios</p>
        <div className="space-y-1.5">
          {['Huamachuco', 'Huamachuco', 'Huamachuco', 'Huamachuco'].map((point, index) => (
            <div key={`${point}-${index}`} className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F9448]">
                <img src={checkIcon} alt="" className="h-3 w-3 brightness-0 invert" />
              </span>
              {point}
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

    const base = form.tipo === 'Sobres' ? 8 : 12;
    const fragilityFee = form.fragilidad === 'Fragil' ? 6 : 0;
    const amount = Math.max(base + weight * 2.4 + volume / 6500 + fragilityFee, 10);
    setQuote(Number(amount.toFixed(2)));
  };

  return (
    <article id="destinos" className="min-w-0 border border-gray-100 bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.18)] sm:p-8">
      <h2 className="text-3xl font-black text-[#7B7B7B] lg:text-4xl">COTIZADOR DE ENVIOS</h2>

      <div className="mt-8 grid gap-8 min-[1700px]:grid-cols-[minmax(200px,0.9fr)_minmax(130px,0.58fr)_minmax(200px,0.9fr)_minmax(260px,1.05fr)] min-[1900px]:grid-cols-[270px_190px_270px_340px]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black">1. Origen</h3>
          </div>
          <div className={`${greenPanel} grid gap-7`}>
            <SelectField label="Departamento" value="La Libertad" />
            <SelectField label="Provincia" value="Trujillo" />
            <SelectField label="Distrito" value="Trujillo" />
          </div>
        </section>

        <RouteConnector />

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={locationIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black">2. Destino</h3>
          </div>
          <div className={`${greenPanel} grid gap-7`}>
            <SelectField label="Departamento" value="La Libertad" />
            <SelectField label="Provincia" value="Santiago de Chuco" />
            <SelectField label="Distrito" value="Angasmarca" />
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <GreenIcon src={packageIcon} className="h-8 w-8" />
            <h3 className="text-lg font-black">3. Detalles del envio</h3>
          </div>
          <form className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm" onSubmit={calculateQuote}>
            <p className="text-sm font-medium text-gray-500">Tipo de envio</p>
            <div className="mt-3 flex flex-wrap gap-5">
              {['Sobres', 'Paquetes'].map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm font-medium">
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

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-gray-500">Peso total</span>
              <div className="grid grid-cols-[1fr_68px] overflow-hidden rounded-md bg-white shadow-md shadow-gray-300/60">
                <input
                  className="min-h-11 border border-gray-100 px-3 text-sm outline-none focus:border-[#2F9448]"
                  min="0"
                  name="peso"
                  placeholder="Ingrese peso"
                  step="0.1"
                  type="number"
                  value={form.peso}
                  onChange={updateField}
                />
                <span className="flex items-center justify-center border border-l-0 border-gray-100 text-sm font-medium text-gray-500">Kg</span>
              </div>
            </label>

            <div className="mt-5">
              <p className="text-sm font-medium text-gray-500">Medidas del paquete (cm)</p>
              <div className="mt-3 grid grid-cols-3 gap-4">
                {[
                  ['largo', 'Largo'],
                  ['ancho', 'Ancho'],
                  ['alto', 'Alto'],
                ].map(([name, label]) => (
                  <label key={name} className="grid gap-1">
                    <span className="text-sm text-gray-500">{label}</span>
                    <input className={inputClass} min="0" name={name} step="0.1" type="number" value={form[name]} onChange={updateField} />
                  </label>
                ))}
              </div>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium text-gray-500">Fragilidad</span>
              <select className={inputClass} name="fragilidad" value={form.fragilidad} onChange={updateField}>
                <option value="">Seleccionar</option>
                <option value="No fragil">No fragil</option>
                <option value="Fragil">Fragil</option>
              </select>
            </label>

            {error && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{error}</p>}

            <button
              className="mx-auto mt-5 flex min-h-12 w-full max-w-[150px] items-center justify-center rounded-lg bg-[#2F9448] px-6 text-base font-black text-white transition hover:bg-[#356B3F] disabled:cursor-not-allowed disabled:bg-gray-300"
              type="submit"
              disabled={!isComplete}
            >
              COTIZAR
            </button>
          </form>
        </section>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[250px_1fr_auto] 2xl:grid-cols-[270px_1fr_auto]">
        <div className="rounded-lg bg-[#E4ECE2] px-6 py-4 text-center">
          <p className="text-sm font-bold text-[#356B3F]">Tiempo estimado de entrega</p>
          <p className="text-lg font-black text-black">12 a 24 horas</p>
        </div>

        <div className="rounded-lg bg-[#3D7046] px-6 py-4 text-white">
          <p className="text-sm font-medium text-white/90">Precio estimado</p>
          <p className="text-4xl font-black">S/ {quote ? quote.toFixed(2) : '0.00'}</p>
        </div>

        {quote && (
          <Link
            to="/registrar-envio"
            className="inline-flex min-h-16 items-center justify-center gap-3 rounded-lg bg-[#2F9448] px-6 text-base font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-[#356B3F]"
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
