import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { adminNavigationItems } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';

function getInitials(user) {
  const name = user?.full_name || user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

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
    <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 px-4 py-3.5 shadow-[0_4px_20px_-12px_rgba(33,37,41,0.25)] backdrop-blur-md lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-brand-gray">
          <span className="font-bold uppercase tracking-wide text-brand-green">Carmencita Express</span>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-black text-brand-black sm:text-xl">{currentModule}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-dark text-xs font-black text-white">
                {getInitials(user)}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold leading-tight text-brand-black">{user.full_name || user.username}</p>
                <p className="text-xs font-medium leading-tight text-brand-gray">{roles}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-bold text-brand-gray shadow-sm transition hover:border-brand-green hover:bg-brand-surface hover:text-brand-black"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar sesion</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
