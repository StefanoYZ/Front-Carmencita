import React from 'react';
import { LogOut, PackageOpen } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/external/logo.png';
import { useAuth } from '../context/AuthContext.jsx';

function StowageLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF,#F3F7F4)] text-brand-black">
      <header className="sticky top-0 z-30 border-b border-brand-dark/15 bg-brand-dark px-4 py-3 text-white shadow-[0_12px_28px_rgba(33,37,41,0.18)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={logo}
              alt="Carmencita Express Cargo"
              className="h-14 w-auto shrink-0 brightness-0 invert"
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
            <div className="min-w-0 text-left sm:text-right">
              <p className="truncate text-sm font-black">{user?.full_name || user?.username}</p>
              <p className="text-xs font-semibold text-white/65">ESTIBA</p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white hover:text-brand-dark"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-3 py-5 sm:px-5 lg:px-7">
        <Outlet />
      </main>
    </div>
  );
}

export default StowageLayout;
