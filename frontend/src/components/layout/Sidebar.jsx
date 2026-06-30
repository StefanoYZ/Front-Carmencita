import React from 'react';
import { NavLink } from 'react-router-dom';
import { getAllowedNavigation } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/external/logo.png';
import cuentaIcon from '../../assets/icons/cuenta.svg';
import paqueteIcon from '../../assets/icons/paquete.svg';
import marcadorIcon from '../../assets/icons/marcador-de-posicion.svg';
import tareaIcon from '../../assets/icons/tarea.svg';

const navIcons = {
  Dashboard: tareaIcon,
  Clientes: cuentaIcon,
  Encomiendas: paqueteIcon,
  Destinos: marcadorIcon,
  'Usuarios internos': cuentaIcon,
};

function getInitials(user) {
  const name = user?.full_name || user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function Sidebar() {
  const { user } = useAuth();
  const links = getAllowedNavigation(user);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 overflow-hidden bg-gradient-to-b from-[#1f4d2f] via-brand-dark to-[#16331f] px-4 py-5 shadow-[10px_0_40px_rgba(33,37,41,0.22)] lg:flex lg:flex-col">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-lime/10 blur-3xl" />

      <div className="relative px-1 py-1">
        <img
          src={logo}
          alt="Carmencita Smart System"
          className="h-20 w-full object-contain brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
        />
      </div>

      <p className="relative mt-5 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-brand-lime/90">
        Gestion interna
      </p>

      <nav className="relative mt-3 space-y-1" aria-label="Navegacion principal">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'active bg-white text-brand-black shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {/* Indicador activo */}
            <span className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-x-1 -translate-y-1/2 rounded-full bg-brand-green group-[.active]:block" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition group-[.active]:bg-brand-lime/40" aria-hidden="true">
              <img
                src={navIcons[link.label] || tareaIcon}
                alt=""
                className="h-4 w-4 brightness-0 invert transition group-[.active]:invert-0"
              />
            </span>
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="relative mt-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-sm backdrop-blur">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lime/30 text-sm font-black text-white ring-1 ring-white/20">
            {getInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.full_name || user.username}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-brand-lime/90">
              {(user.roles || []).join(', ') || 'Sin rol'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
