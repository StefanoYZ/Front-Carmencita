import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[86px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:min-h-[104px] lg:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="Carmencita Express" className="h-14 w-auto sm:h-16 lg:h-[72px]" />
          <span className="sr-only">Carmencita Express Cargo</span>
        </NavLink>

        <nav className="hidden items-center gap-7 text-[15px] font-black text-black xl:flex 2xl:gap-9 2xl:text-base">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `relative py-3 transition hover:text-[#28A745] ${
                  isActive && item.to === '/' ? 'text-[#28A745] after:absolute after:inset-x-1 after:bottom-0 after:h-1 after:rounded-full after:bg-[#28A745]' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          <a href="tel:044222222" className="flex items-center gap-2 text-sm font-black text-[#28A745] 2xl:text-base">
            <img src={phoneIcon} alt="" className="h-6 w-6" />
            (044)-222222
          </a>
          <NavLink
            to="/registrar-envio"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#28A745] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:bg-[#3C5940] 2xl:text-base"
          >
            <img src={packageIcon} alt="" className="h-6 w-6 brightness-0 invert" />
            Registro de envio
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
              <NavLink key={item.label} to={item.to} className="rounded-md px-3 py-2 hover:bg-[#F8F9FA]" onClick={() => setOpen(false)}>
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
          </nav>
        </div>
      )}
    </header>
  );
}

export default PublicHeader;
