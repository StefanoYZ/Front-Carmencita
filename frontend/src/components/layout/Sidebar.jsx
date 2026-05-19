import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const links = [
  { label: 'Dashboard', path: '/' },
  { label: 'Clientes', path: '/clientes' },
  { label: 'Encomiendas', path: '/encomiendas' },
  { label: 'Cotizacion', path: '/cotizacion' },
  { label: 'Tracking', path: '/tracking' },
  { label: 'SUNAT / Boletas', path: '/sunat-boletas' },
  { label: 'RENIEC', path: '/reniec' },
  { label: 'Optimizacion de carga', path: '/optimizacion-carga' },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-gray-200 bg-white px-4 py-5 lg:block">
      <img src={logo} alt="Carmencita Smart System" className="h-10 w-40" />
      <nav className="mt-8 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-green-50 text-brand-green'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
