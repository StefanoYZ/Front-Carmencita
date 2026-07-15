import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({ label, id, className = '', error, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</span>}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 pr-11 text-sm text-brand-black shadow-sm outline-none transition placeholder:text-brand-gray/60 hover:border-brand-lime focus:ring-4 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-brand-green focus:ring-brand-lime/30'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-gray transition hover:bg-brand-surface hover:text-brand-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export default PasswordInput;
