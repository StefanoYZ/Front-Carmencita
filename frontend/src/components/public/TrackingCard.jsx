import React, { useEffect, useState } from 'react';
import { getEncomiendaByCodigo } from '../../services/encomiendasService.js';
import {
  formatShipmentCode,
  isCompleteTrackingCode,
  parseShipmentCode,
  sanitizeTrackingCode,
} from '../../utils/formatShipmentCode.js';
import TrackingProgress from './TrackingProgress.jsx';
import searchIcon from '../../assets/icons/lupa.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import locationIcon from '../../assets/icons/pin-de-ubicacion.svg';

function GreenIcon({ src }) {
  return (
    <span
      className="mt-0.5 block h-5 w-5 shrink-0 bg-[#28A745]"
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

function TrackingCard({ initialCode = '' }) {
  const [codigo, setCodigo] = useState(initialCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const searchByCode = async (cleanCode) => {
    if (!cleanCode) {
      setResult(null);
      setMessage('Ingresa un codigo de envio.');
      return;
    }

    if (!isCompleteTrackingCode(cleanCode)) {
      setResult(null);
      setMessage('Codigo invalido: debe ser una letra (L, M, X, J, V, S o D) seguida de 9 numeros. Ej: D000000001.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setResult(null);
      const data = await getEncomiendaByCodigo(parseShipmentCode(cleanCode));
      setResult(data);
    } catch (error) {
      setResult(null);
      if (error?.response?.status === 404) {
        setMessage('No se encontro una encomienda con ese codigo.');
      } else if (!error?.response) {
        setMessage('No se pudo conectar con el servidor.');
      } else {
        setMessage('No se pudo consultar el rastreo en este momento.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanInitialCode = initialCode.trim();
    if (cleanInitialCode) {
      setCodigo(cleanInitialCode);
      searchByCode(cleanInitialCode);
    }
  }, [initialCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    searchByCode(codigo.trim());
  };

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_2px_rgba(33,37,41,0.04),0_18px_44px_-20px_rgba(33,37,41,0.28)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f4d2f] via-[#3C5940] to-[#16331f] p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-green/25 blur-3xl" />
        <h2 className="relative text-2xl font-black sm:text-3xl">Rastrea tu encomienda</h2>
        <p className="relative mt-2 max-w-xl text-sm font-semibold leading-6 text-[#F8F9FA] sm:text-base">
          Ingresa tu codigo de envio y conoce el estado actual de tu encomienda.
        </p>

        <form className="mt-5 grid min-w-0 gap-2 rounded-lg bg-white p-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
          <label className="grid min-w-0">
            <input
              className="min-h-12 min-w-0 rounded-md border-0 px-4 text-base font-bold uppercase text-gray-800 outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:ring-2 focus:ring-[#A3CF84]"
              value={codigo}
              onChange={(event) => setCodigo(sanitizeTrackingCode(event.target.value))}
              inputMode="text"
              maxLength={10}
              placeholder="Ejemplo: D000000001"
            />
          </label>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#28A745] to-[#1f8f3a] px-4 text-sm font-black text-white shadow-[0_6px_16px_-4px_rgba(40,167,69,0.45)] transition hover:from-[#2fb850] hover:to-[#3C5940] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            type="submit"
            disabled={loading}
          >
            <img src={searchIcon} alt="" className="h-5 w-5 brightness-0 invert" />
            {loading ? 'Buscando...' : 'Rastrear'}
          </button>
        </form>
      </div>

      <div className="min-h-[220px] p-5 sm:p-6">
        {message && (
          <div className="mb-6 rounded-md border border-[#A3CF84] bg-[#F8F9FA] p-3 text-sm font-semibold text-[#3C5940]">
            {message}
          </div>
        )}

        <div>
          <TrackingProgress estado={result?.estado} />
        </div>

        {result && (
          <div className="mt-6 grid min-w-0 gap-3 rounded-md border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <GreenIcon src={packageIcon} />
              <div className="min-w-0">
                <p className="text-gray-500">Codigo</p>
                <p className="break-words font-black text-[#212529]">{formatShipmentCode(result.codigo_encomienda)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <GreenIcon src={locationIcon} />
              <div className="min-w-0">
                <p className="text-gray-500">Ruta</p>
                <p className="break-words font-black text-[#212529]">{result.origen || 'Trujillo'} - {result.destino || 'Angasmarca'}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Estado actual</p>
              <p className="font-black text-[#3C5940]">{result.estado || 'Sin estado'}</p>
            </div>
            <div>
              <p className="text-gray-500">Destinatario</p>
              <p className="font-black text-[#212529]">{result.destinatario_nombre || '-'}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default TrackingCard;
