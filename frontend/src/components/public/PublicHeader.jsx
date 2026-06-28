import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import logo from '../../assets/external/logo.png';
import phoneIcon from '../../assets/icons/telefono.svg';
import packageIcon from '../../assets/icons/paquete.svg';

const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Servicios', to: '/#servicios' },
  { label: 'Destinos', to: '/#destinos' },
  { label: 'Nosotros', to: '/#nosotros' },
  { label: 'Contacto', to: '/#contacto' },
];

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActiveItem = (item) => {
    if (location.pathname !== '/') return false;
    if (item.to === '/') return !location.hash;
    return item.to === `/${location.hash}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 shadow-[0_4px_20px_-12px_rgba(33,37,41,0.25)] backdrop-blur-md">
      <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[92px] lg:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="Carmencita Express" className="h-14 w-auto sm:h-16 lg:h-[72px]" />
          <span className="sr-only">Carmencita Express Cargo</span>
        </NavLink>

        <nav className="hidden items-center gap-5 text-sm font-black text-black xl:flex 2xl:gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={() =>
                `relative py-3 transition hover:text-[#28A745] ${
                  isActiveItem(item)
                    ? 'text-[#28A745] after:absolute after:inset-x-1 after:bottom-0 after:h-1 after:rounded-full after:bg-[#28A745]'
                    : ''
                }`
              }
              aria-current={isActiveItem(item) ? 'page' : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <a href="tel:044222222" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-black text-[#28A745]">
            <img src={phoneIcon} alt="" className="h-5 w-5" />
            (044)-222222
          </a>
          <NavLink
            to="/registrar-envio"
            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-b from-[#28A745] to-[#1f8f3a] px-3.5 py-2 text-[13px] font-black text-white shadow-[0_6px_16px_-4px_rgba(40,167,69,0.45)] transition hover:-translate-y-0.5 hover:from-[#2fb850] hover:to-[#3C5940]"
          >
            <img src={packageIcon} alt="" className="h-5 w-5 brightness-0 invert" />
            Registro de envio
          </NavLink>
          <NavLink
            to="/login"
            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#3C5940] bg-white px-3.5 py-2 text-[13px] font-black text-[#3C5940] transition hover:bg-[#E4ECE2]"
          >
            <LogIn size={17} />
            Acceso interno
          </NavLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 xl:hidden"
          aria-label="Abrir menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex w-5 flex-col gap-1">
            <span className="h-0.5 rounded-full bg-gray-800" />
            <span className="h-0.5 rounded-full bg-gray-800" />
            <span className="h-0.5 rounded-full bg-gray-800" />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-lg xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 text-sm font-semibold text-gray-700">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={`rounded-md border-l-4 px-3 py-2 transition ${
                  isActiveItem(item)
                    ? 'border-[#28A745] bg-[#E4ECE2] font-black text-[#28A745]'
                    : 'border-transparent hover:bg-[#F8F9FA]'
                }`}
                aria-current={isActiveItem(item) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <a href="tel:044222222" className="flex items-center gap-2 rounded-md px-3 py-2">
              <img src={phoneIcon} alt="" className="h-5 w-5" />
              (044)-222222
            </a>
            <NavLink
              to="/registrar-envio"
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#28A745] px-4 py-2.5 font-bold text-white"
              onClick={() => setOpen(false)}
            >
              <img src={packageIcon} alt="" className="h-5 w-5 brightness-0 invert" />
              Registro de envio
            </NavLink>
            <NavLink
              to="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#3C5940] bg-white px-4 py-2.5 font-bold text-[#3C5940]"
              onClick={() => setOpen(false)}
            >
              <LogIn size={18} />
              Acceso interno
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

export default PublicHeader;
