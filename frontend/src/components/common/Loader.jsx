import React from 'react';
function Loader({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-brand-green" />
      {label}
    </div>
  );
}

export default Loader;
