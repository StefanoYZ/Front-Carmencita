import React from 'react';
import { Link } from 'react-router-dom';
import BenefitsBar from './BenefitsBar.jsx';
import packageIcon from '../../assets/icons/paquete.svg';

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-[center_right_32%]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(33,37,41,0.80) 0%, rgba(33,37,41,0.70) 34%, rgba(33,37,41,0.48) 58%, rgba(33,37,41,0.22) 78%, rgba(33,37,41,0.08) 100%), linear-gradient(180deg, rgba(33,37,41,0.04) 0%, rgba(33,37,41,0.18) 72%, rgba(33,37,41,0.34) 100%), url('/images/hero-camion.png')",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#212529]/35 to-transparent" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:min-h-[600px] lg:px-8">
        <div className="public-hero-content max-w-[600px]">
          <h1 className="text-[36px] font-black leading-[1.12] text-white drop-shadow-sm sm:text-6xl lg:text-[58px] xl:text-[62px]">
            Enviamos lo que te importa
            <span className="mt-3 block text-[#A3CF84]">seguro y a tiempo</span>
          </h1>
          <div className="public-hero-accent mt-9 h-1.5 w-24 rounded-full bg-[#A3CF84] sm:h-2 sm:w-28" />
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/90 sm:text-lg">
            Conectamos Trujillo con Angasmarca y mas destinos, brindamos un servicio confiable, rapido y eficiente para tus encomiendas.
          </p>
          <Link
            to="/registrar-envio"
            className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-lg bg-[#28A745] px-6 py-4 text-base font-black text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#3C5940] sm:text-lg"
          >
            <img src={packageIcon} alt="" className="h-8 w-8 brightness-0 invert" />
            Registro de envio
          </Link>
        </div>

        <div className="mt-12 w-full max-w-[760px] pl-0 sm:mt-14 lg:ml-6">
          <BenefitsBar />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
