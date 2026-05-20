import React from 'react';
import { NavLink } from 'react-router-dom';
import { getAllowedNavigation } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/icons/logo.svg';

function Sidebar() {
  const { user } = useAuth();
  const links = getAllowedNavigation(user);

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

      {user && (
        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="truncate text-sm font-semibold text-brand-black">{user.full_name || user.username}</p>
          <p className="mt-1 truncate text-xs font-medium text-gray-500">{(user.roles || []).join(', ') || 'Sin rol'}</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
