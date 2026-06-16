import React from 'react';
function Input({ label, id, className = '', error, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-brand-black">{label}</span>}
      <input
        id={id}
        className={`min-h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-brand-black shadow-sm outline-none transition placeholder:text-brand-gray/70 hover:border-brand-lime focus:ring-2 ${
          error
            ? 'border-brand-dark focus:border-brand-dark focus:ring-brand-lime/50'
            : 'border-gray-200 focus:border-brand-green focus:ring-brand-lime/50'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-semibold text-brand-dark">{error}</span>}
    </label>
  );
}

export default Input;
