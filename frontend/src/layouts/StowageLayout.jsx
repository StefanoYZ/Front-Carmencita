import React from 'react';
import { LogOut, PackageOpen } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/external/logo.png';
import { useAuth } from '../context/AuthContext.jsx';

function getInitials(user) {
  const name = user?.full_name || user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function StowageLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF,#F3F7F4)] text-brand-black">
      <a
        href="#contenido-estiba"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-brand-dark focus:shadow-lg focus:ring-2 focus:ring-brand-green"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#1f4d2f] via-brand-dark to-[#16331f] px-4 py-3.5 text-white shadow-[0_14px_34px_-14px_rgba(33,37,41,0.45)] sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-[1800px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={logo}
              alt="Carmencita Express Cargo"
              className="h-14 w-auto shrink-0 brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
            />
            <div className="min-w-0 border-l border-white/25 pl-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-lime">
                <PackageOpen size={16} />
                Portal de estiba
              </p>
              <h1 className="truncate text-lg font-black sm:text-xl">Optimización de carga</h1>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lime/30 text-xs font-black text-white ring-1 ring-white/20">
                {getInitials(user)}
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-black leading-tight">{user?.full_name || user?.username}</p>
                <p className="text-xs font-semibold leading-tight text-brand-lime/90">ESTIBA</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white hover:text-brand-dark"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main id="contenido-estiba" className="mx-auto max-w-[1800px] px-3 py-5 sm:px-5 lg:px-7">
        <Outlet />
      </main>
    </div>
  );
}

export default StowageLayout;
