import React from 'react';

function Input({ label, id, className = '', error, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</span>}
      <input
        id={id}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-brand-black shadow-sm outline-none transition placeholder:text-brand-gray/60 hover:border-brand-lime focus:ring-4 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 focus:border-brand-green focus:ring-brand-lime/30'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export default Input;
