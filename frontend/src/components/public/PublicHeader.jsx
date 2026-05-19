import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/icons/logo.svg';
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
      <div className="mx-auto flex min-h-[92px] max-w-[1840px] items-center justify-between gap-5 px-5 sm:px-8 lg:min-h-[118px] lg:px-16">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="Carmencita Express" className="h-14 w-auto sm:h-16 lg:h-[82px]" />
          <span className="sr-only">Carmencita Express Cargo</span>
        </NavLink>

        <nav className="hidden items-center gap-9 text-[17px] font-black text-black xl:flex 2xl:gap-14 2xl:text-2xl">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `relative py-3 transition hover:text-[#2F9448] ${
                  isActive && item.to === '/' ? 'text-[#2F9448] after:absolute after:inset-x-1 after:bottom-0 after:h-1 after:rounded-full after:bg-[#2F9448]' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-6 xl:flex">
          <a href="tel:044222222" className="flex items-center gap-3 text-base font-black text-[#2F9448] 2xl:text-2xl">
            <img src={phoneIcon} alt="" className="h-7 w-7 2xl:h-10 2xl:w-10" />
            (044)-222222
          </a>
          <NavLink
            to="/registrar-envio"
            className="inline-flex min-h-16 items-center gap-3 rounded-lg bg-[#2F9448] px-6 py-3 text-base font-black text-white shadow-lg shadow-green-900/10 transition hover:bg-[#356B3F] 2xl:min-h-20 2xl:px-8 2xl:text-2xl"
          >
            <img src={packageIcon} alt="" className="h-8 w-8 brightness-0 invert 2xl:h-10 2xl:w-10" />
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
              <NavLink key={item.label} to={item.to} className="rounded-md px-3 py-2 hover:bg-green-50" onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <a href="tel:044222222" className="flex items-center gap-2 rounded-md px-3 py-2">
              <img src={phoneIcon} alt="" className="h-5 w-5" />
              (044)-222222
            </a>
            <NavLink
              to="/registrar-envio"
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#2F9448] px-4 py-2.5 font-bold text-white"
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
