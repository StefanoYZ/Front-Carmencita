import React from 'react';
import packageIcon from '../../assets/icons/paquete.svg';
import truckIcon from '../../assets/icons/camion.svg';
import locationIcon from '../../assets/icons/pin-de-ubicacion.svg';
import checkIcon from '../../assets/icons/flecha-correcta.svg';

const steps = [
  { key: 'recepcionado', label: 'Recepcionado', icon: packageIcon },
  { key: 'transito', label: 'En transito', icon: truckIcon },
  { key: 'destino', label: 'En destino', icon: locationIcon },
  { key: 'entregado', label: 'Entregado', icon: checkIcon },
];

const statusIndex = {
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
    <span
      className={`block h-10 w-10 ${active ? 'bg-white' : 'bg-[#2F9448]'}`}
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
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
    <div className="relative mx-auto grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
      <div className="absolute left-[12%] right-[12%] top-9 hidden h-1 bg-[#2F9448]/55 sm:block" />
      {steps.map((step, index) => {
        const completed = activeIndex >= index;
        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
            <span className={`flex h-[74px] w-[74px] items-center justify-center rounded-full border-4 ${completed ? 'border-[#2F9448] bg-[#2F9448]' : 'border-[#2F9448]/35 bg-white'}`}>
              <GreenIcon src={step.icon} active={completed} />
            </span>
            <span className="mt-3 text-xs font-black text-[#1F2937]">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TrackingProgress;
