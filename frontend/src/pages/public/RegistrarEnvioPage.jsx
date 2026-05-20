import React from 'react';
import { Link } from 'react-router-dom';
import packageIcon from '../../assets/icons/paquete.svg';

function RegistrarEnvioPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg border border-gray-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-green-50">
            <img src={packageIcon} alt="" className="h-8 w-8" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#2F9448]">Registro de envio</p>
            <h1 className="mt-2 text-3xl font-black text-[#1F2937]">Coordina tu encomienda con Carmencita Express.</h1>
            <p className="mt-4 leading-7 text-gray-600">
              Esta vista publica queda preparada para el registro externo. Por ahora el registro operativo completo se mantiene en el modulo interno para no alterar el flujo administrativo existente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/tracking" className="rounded-md border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Rastrear encomienda
              </Link>
              <Link to="/cotizar" className="rounded-md bg-[#2F9448] px-5 py-3 text-sm font-bold text-white hover:bg-[#356B3F]">
                Cotizar envio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegistrarEnvioPage;
