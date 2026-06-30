import React from 'react';
import shieldIcon from '../../assets/icons/confiable.svg';
import clockIcon from '../../assets/icons/tiempo-rapido.svg';
import supportIcon from '../../assets/icons/apoyo.svg';

const benefits = [
  { label: 'Seguro y confiable', icon: shieldIcon },
  { label: 'Entregas a tiempo', icon: clockIcon },
  { label: 'Atencion personalizada', icon: supportIcon },
];

function GreenIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      className="h-12 w-12 object-contain"
      style={{ filter: 'invert(57%) sepia(67%) saturate(739%) hue-rotate(75deg) brightness(93%) contrast(88%)' }}
    />
  );
}

function BenefitsBar() {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-[rgba(33,37,41,0.78)] p-3 shadow-2xl backdrop-blur-md md:grid-cols-3">
      {benefits.map((benefit) => (
        <div key={benefit.label} className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-white/5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-white/10">
            <GreenIcon src={benefit.icon} />
          </span>
          <span className="max-w-[150px] text-base font-black leading-tight text-white drop-shadow">{benefit.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BenefitsBar;
