import React from 'react';

/**
 * Tile reutilizable de una opcion de accesibilidad: icono arriba y etiqueta
 * debajo, en una cuadricula. `active` marca visualmente y via aria-pressed.
 * `value` muestra el estado actual (p. ej. el % de texto o la saturacion).
 */
export default function AccessibilityOptionButton({
  icon: Icon,
  label,
  active = false,
  value,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 ${
        active
          ? 'border-brand-green bg-brand-lime/15 shadow-[0_8px_18px_-10px_rgba(40,167,69,0.5)]'
          : 'border-gray-200 bg-white hover:border-brand-green/50 hover:bg-brand-surface'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          active ? 'bg-brand-green text-white' : 'bg-brand-surface text-brand-dark'
        }`}
        aria-hidden="true"
      >
        {Icon && <Icon size={22} />}
      </span>
      <span className="text-xs font-bold leading-tight text-brand-black">{label}</span>
      {value != null && (
        <span className="text-[11px] font-black text-brand-green">{value}</span>
      )}
      <span className="sr-only">{active ? '(activado)' : '(desactivado)'}</span>
    </button>
  );
}
