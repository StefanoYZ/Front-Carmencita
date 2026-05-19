import React, { useEffect, useState } from 'react';
import { getEncomiendaByCodigo } from '../../services/encomiendasService.js';
import { formatShipmentCode, parseShipmentCode } from '../../utils/formatShipmentCode.js';
import TrackingProgress from './TrackingProgress.jsx';
import searchIcon from '../../assets/icons/lupa.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import locationIcon from '../../assets/icons/pin-de-ubicacion.svg';

function GreenIcon({ src }) {
  return (
    <span
      className="mt-0.5 block h-5 w-5 shrink-0 bg-[#2F9448]"
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
    <article className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#3D7046] p-6 text-white sm:p-8">
        <h2 className="text-3xl font-black lg:text-4xl">Rastrea tu encomienda</h2>
        <p className="mt-2 max-w-xl text-base font-semibold leading-6 text-white/90">
          Ingresa tu codigo de envio y conoce el estado actual de tu encomienda.
        </p>

        <form className="mt-6 grid overflow-hidden rounded-md bg-white sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
          <label className="grid">
            <input
              className="min-h-14 border-0 px-6 text-lg font-semibold uppercase text-gray-700 outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:ring-2 focus:ring-green-100"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Ejemplo: D000000001"
            />
          </label>
          <button
            className="m-1 inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-white bg-[#3D7046] px-6 text-lg font-black text-white transition hover:bg-[#356B3F] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            <img src={searchIcon} alt="" className="h-7 w-7 brightness-0 invert" />
            {loading ? 'Buscando...' : 'Rastrear'}
          </button>
        </form>
      </div>

      <div className="min-h-[230px] p-6 sm:p-10">
        {message && (
          <div className="mb-7 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {message}
          </div>
        )}

        <div>
          <TrackingProgress estado={result?.estado} />
        </div>

        {result && (
          <div className="mt-6 grid gap-3 rounded-md border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <GreenIcon src={packageIcon} />
              <div>
                <p className="text-gray-500">Codigo</p>
                <p className="font-black text-[#1F2937]">{formatShipmentCode(result.codigo_encomienda)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <GreenIcon src={locationIcon} />
              <div>
                <p className="text-gray-500">Ruta</p>
                <p className="font-black text-[#1F2937]">{result.origen || 'Trujillo'} - {result.destino || 'Angasmarca'}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Estado actual</p>
              <p className="font-black text-[#356B3F]">{result.estado || 'Sin estado'}</p>
            </div>
            <div>
              <p className="text-gray-500">Destinatario</p>
              <p className="font-black text-[#1F2937]">{result.destinatario_nombre || '-'}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default TrackingCard;
