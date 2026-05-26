import React from 'react';
function Input({ label, id, className = '', error, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        id={id}
        className={`min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition placeholder:text-gray-400 focus:border-brand-green focus:ring-2 focus:ring-green-100 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export default Input;
