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

function Sidebar() {
  const { user } = useAuth();
  const links = getAllowedNavigation(user);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-brand-dark bg-brand-dark px-4 py-5 shadow-[10px_0_32px_rgba(33,37,41,0.16)] lg:block">
      <div className="px-0 py-2">
        <img
          src={logo}
          alt="Carmencita Smart System"
          className="h-24 w-full object-contain brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
        />
      </div>
      <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wide text-brand-lime">Gestion interna</p>
      <nav className="mt-4 space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `group flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'active bg-white text-brand-black shadow-sm'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 group-[.active]:bg-brand-lime/35">
              <img
                src={navIcons[link.label] || tareaIcon}
                alt=""
                className="h-4 w-4 brightness-0 invert group-[.active]:invert-0"
              />
            </span>
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-white/10 bg-white/10 p-3 text-white shadow-sm">
          <p className="truncate text-sm font-semibold">{user.full_name || user.username}</p>
          <p className="mt-1 truncate text-xs font-medium text-white/70">{(user.roles || []).join(', ') || 'Sin rol'}</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
