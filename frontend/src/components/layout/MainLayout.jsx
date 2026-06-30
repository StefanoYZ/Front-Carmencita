import React from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(120%_120%_at_0%_0%,#FFFFFF_0%,#F8F9FA_45%,#EFF3ED_100%)]">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-brand-dark focus:shadow-lg focus:ring-2 focus:ring-brand-green"
      >
        Saltar al contenido
      </a>
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main id="contenido-principal" className="px-4 py-7 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
