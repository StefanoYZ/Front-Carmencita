import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader.jsx';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1F2937]">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#356B3F]">Carmencita Express Cargo</p>
            <p>Transporte y carga general</p>
          </div>
          <p>Trujillo - Angasmarca</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
