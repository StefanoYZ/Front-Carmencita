import React from 'react';

function Loader({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center gap-3 py-2 text-sm font-medium text-brand-gray" role="status" aria-live="polite">
      <span className="relative flex h-5 w-5" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-lime/40" />
        <span className="relative h-5 w-5 animate-spin rounded-full border-2 border-brand-lime/40 border-t-brand-green" />
      </span>
      {label}
    </div>
  );
}

export default Loader;
