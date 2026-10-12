import { useEffect, useState } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_120%_at_0%_0%,#FFFFFF_0%,#F8F9FA_45%,#EFF3ED_100%)]">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-brand-dark focus:shadow-lg focus:ring-2 focus:ring-brand-green"
      >
        Saltar al contenido
      </a>
      {mobileMenuOpen && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-[19] bg-black/45 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileMenuOpen}
        onExpand={() => setCollapsed(false)}
        onCollapse={() => setCollapsed(true)}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Header mobileMenuOpen={mobileMenuOpen} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main id="contenido-principal" className="px-4 py-7 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
