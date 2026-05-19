import React from 'react';
import packageIcon from '../../assets/icons/paquete.svg';
import locationIcon from '../../assets/icons/pin-de-ubicacion.svg';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

const steps = [
  { key: 'recepcionado', label: 'Recepcionado', icon: packageIcon },
  { key: 'transito', label: 'En transito', icon: checkIcon },
  { key: 'destino', label: 'En destino', icon: locationIcon },
  { key: 'entregado', label: 'Entregado', icon: checkIcon },
];

const statusIndex = {
  PRE_REGISTRADA: 0,
  REGISTRADA: 0,
  COTIZADA: 0,
  PAGO_CONFIRMADO: 0,
  BOLETA_EMITIDA: 0,
  EN_TRANSITO: 1,
  EN_DESTINO: 2,
  ENTREGADA: 3,
};

function GreenIcon({ src, active }) {
  return (
    <img
      src={src}
      alt=""
      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
      style={{
        filter: active
          ? 'brightness(0) invert(1)'
          : 'invert(42%) sepia(70%) saturate(555%) hue-rotate(88deg) brightness(91%) contrast(86%)',
      }}
    />
  );
}

function TrackingProgress({ estado }) {
  const normalized = String(estado || '').toUpperCase();

  if (normalized === 'ANULADA') {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        Esta encomienda fue anulada.
      </div>
    );
  }

  const activeIndex = Object.prototype.hasOwnProperty.call(statusIndex, normalized) ? statusIndex[normalized] : -1;

  return (
    <div className="relative mx-auto grid max-w-3xl grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
      <div className="absolute left-[12%] right-[12%] top-8 hidden h-1 bg-[#2F9448]/55 sm:block" />
      {steps.map((step, index) => {
        const completed = activeIndex >= index;
        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] sm:h-16 sm:w-16 ${completed ? 'border-[#2F9448] bg-[#2F9448]' : 'border-[#2F9448]/35 bg-white'}`}>
              <GreenIcon src={step.icon} active={completed} />
            </span>
            <span className="mt-2 text-[11px] font-black leading-tight text-[#1F2937] sm:text-xs">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TrackingProgress;
