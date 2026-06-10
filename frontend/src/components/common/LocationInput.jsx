import React from 'react';

function normalizeOption(option) {
  return typeof option === 'string' ? option : option?.nombre || option?.name || '';
}

function LocationInput({ label, name, value, onChange, error, options = [], required = false }) {
  const normalizedOptions = options.map(normalizeOption).filter(Boolean);

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-brand-black">{label}</span>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-brand-black outline-none transition hover:border-brand-lime focus:border-brand-green focus:ring-2 focus:ring-brand-lime/50"
      >
        <option value="">Seleccionar</option>
        {normalizedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs font-semibold text-brand-dark">{error}</span>}
    </label>
  );
}

export default LocationInput;
