import React from 'react';
import { Link } from 'react-router-dom';
import BenefitsBar from './BenefitsBar.jsx';
import packageIcon from '../../assets/icons/paquete.svg';

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-[center_right_28%]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(18,33,38,0.72) 28%, rgba(30,44,48,0.26) 52%, rgba(0,0,0,0.04) 100%), url('/images/hero-camion.png')",
      }}
    >
      <div className="absolute inset-y-0 left-0 hidden w-[44%] bg-black/[0.18] backdrop-blur-sm lg:block" />

      <div className="relative mx-auto flex min-h-[650px] max-w-[1840px] flex-col justify-center px-5 py-12 sm:px-8 lg:min-h-[680px] lg:px-16 2xl:min-h-[720px]">
        <div className="max-w-[620px] 2xl:max-w-[700px]">
          <h1 className="text-[42px] font-black leading-[1.16] text-white sm:text-6xl lg:text-[66px] 2xl:text-[78px]">
            Enviamos lo que te importa
            <span className="mt-3 block text-[#63C132]">seguro y a tiempo</span>
          </h1>
          <div className="mt-9 h-1.5 w-24 rounded-full bg-[#E5E84C] sm:h-2 sm:w-28" />
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/90 sm:text-lg">
            Conectamos Trujillo con Angasmarca y mas destinos, brindamos un servicio confiable, rapido y eficiente para tus encomiendas.
          </p>
          <Link
            to="/registrar-envio"
            className="mt-8 inline-flex min-h-16 items-center gap-3 rounded-lg bg-[#2F9448] px-6 py-4 text-lg font-black text-white shadow-xl shadow-black/20 transition hover:bg-[#356B3F]"
          >
            <img src={packageIcon} alt="" className="h-8 w-8 brightness-0 invert" />
            Registro de envio
          </Link>
        </div>

        <div id="servicios" className="mt-12 w-full max-w-[760px] pl-0 sm:mt-14 lg:ml-6">
          <BenefitsBar />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
