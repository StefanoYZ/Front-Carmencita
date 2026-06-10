import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TrackingProgress from '../../components/public/TrackingProgress.jsx';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';
import { PUBLIC_SUCCESS_STORAGE_KEY, clearSessionKey, readSessionJSON } from '../../utils/publicShipment.js';
import checkIcon from '../../assets/icons/flecha-correcta.svg';
import packageIcon from '../../assets/icons/paquete.svg';

function RegistroExitosoPage() {
  const location = useLocation();
  const stored = useMemo(() => readSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, null), []);
  const result = location.state?.result || stored?.result || null;
  const summary = location.state?.summary || stored?.summary || null;
  const payment = location.state?.payment || stored?.payment || null;
  const code = formatShipmentCode(result?.codigo_encomienda);
  const estado = result?.estado || 'PRE_REGISTRADA';
  const isPreRegistration = estado === 'PRE_REGISTRADA';
  const paymentLabel =
    payment?.method === 'yape'
      ? 'Yape aprobado'
      : payment?.method === 'card'
        ? 'Tarjeta aprobada'
        : 'Pendiente en agencia';

  useEffect(() => {
    return () => {
      clearSessionKey(PUBLIC_SUCCESS_STORAGE_KEY);
    };
  }, []);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F8F9FA]">
              <img src={checkIcon} alt="" className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black uppercase text-[#28A745]">
                {isPreRegistration ? 'Pre-registro generado' : 'Registro generado'}
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#212529]">
                {isPreRegistration ? 'Tu pre-registro fue generado correctamente.' : 'Tu envio fue registrado correctamente.'}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                {isPreRegistration
                  ? 'Acercate a agencia con este codigo para completar el pago y formalizar el envio.'
                  : 'El pago fue confirmado y el registro formal de la encomienda fue creado.'}
              </p>

              {code ? (
                <div className="mt-6 rounded-lg border border-[#28A745]/30 bg-[#F8F9FA] p-5">
                  <p className="text-sm font-bold uppercase text-[#3C5940]">
                    {isPreRegistration ? 'Codigo de pre-registro' : 'Codigo de encomienda'}
                  </p>
                  <p className="mt-2 break-all text-4xl font-black text-[#212529]">{code}</p>
                  <p className="mt-2 text-sm font-semibold text-[#3C5940]">Estado: {estado}</p>
                </div>
              ) : (
                <div className="mt-6 rounded-md border border-[#A3CF84] bg-[#F8F9FA] p-3 text-sm font-semibold text-[#3C5940]">
                  No hay un codigo cargado en esta sesion. Genera el registro desde el formulario publico.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-5">
            <TrackingProgress estado={estado} />
          </div>

          {summary && (
            <div className="mt-6 grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5 sm:grid-cols-2">
              <SummaryItem label="Ruta" value={`${summary.origen || '-'} - ${summary.destino || '-'}`} />
              <SummaryItem label="Destinatario" value={summary.destinatario_nombre} />
              <SummaryItem label="Contenido" value={summary.tipo_contenido} />
              <SummaryItem label="Pago" value={paymentLabel} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={code ? `/tracking/${code}` : '/tracking'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#28A745] px-5 text-sm font-black text-white transition hover:bg-[#3C5940]"
            >
              <img src={packageIcon} alt="" className="h-5 w-5 brightness-0 invert" />
              Rastrear codigo
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-gray-300 px-5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-black text-[#212529]">{value || '-'}</p>
    </div>
  );
}

export default RegistroExitosoPage;
