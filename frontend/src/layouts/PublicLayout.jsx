import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader.jsx';
import LoadingScreen from '../components/public/LoadingScreen.jsx';
import AssistantFloatingButton from '../components/asistente/AssistantFloatingButton.jsx';

function PublicLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 750);
    const finishTimer = window.setTimeout(() => setLoading(false), 1050);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return undefined;
    }

    const timer = window.setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, loading]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529]">
      {loading && <LoadingScreen leaving={leaving} />}
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-[#212529] px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-[#A3CF84]">Carmencita Express Cargo</p>
            <p className="mt-1 text-white/65">Transporte y carga general</p>
          </div>
          <p className="font-semibold text-white/70">Trujillo - Angasmarca</p>
        </div>
      </footer>
      <AssistantFloatingButton />
    </div>
  );
}

export default PublicLayout;
