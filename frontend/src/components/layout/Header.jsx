import React from 'react';
function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-green">Carmencita Express Cargo</p>
          <h1 className="text-lg font-semibold text-brand-black">Carmencita Smart System</h1>
        </div>
        <div className="text-sm text-gray-500">Maqueta funcional conectable a FastAPI</div>
      </div>
    </header>
  );
}

export default Header;
