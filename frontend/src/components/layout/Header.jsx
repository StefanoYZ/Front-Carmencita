import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminNavigationItems } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const roles = user?.roles?.join(', ') || 'Sin rol';
  const currentModule = adminNavigationItems.find((item) => item.path === location.pathname)?.label || 'Panel interno';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Carmencita Express Cargo</p>
          <h1 className="text-xl font-black text-brand-black">{currentModule}</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {user && (
            <div className="rounded-md border border-gray-200 bg-brand-surface px-3 py-2 text-left sm:text-right">
              <p className="text-sm font-semibold text-brand-black">{user.full_name || user.username}</p>
              <p className="text-xs font-medium text-brand-gray">{roles}</p>
            </div>
          )}
          <button
            type="button"
            className="min-h-10 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-brand-gray transition hover:border-brand-green hover:bg-brand-surface hover:text-brand-black"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
