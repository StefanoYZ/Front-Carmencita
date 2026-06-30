import React, { useState } from 'react';
import { BellRing, X } from 'lucide-react';

export const ASSISTANT_ALERT_EVENT = 'carmencita:assistant-alert';
// Se emite cada vez que cambian las advertencias del paquete, para que el chat
// (si está abierto) actualice el mensaje en tiempo real sin volver a hacer clic.
export const COHERENCE_UPDATE_EVENT = 'carmencita:coherence-update';

/**
 * Campanita flotante que resalta un campo con un posible error. Aparece al costado
 * superior del campo.
 *
 * - mode="chat" (público): al hacer clic abre el chat de CarmiBot con la explicación.
 * - mode="popover" (secretaría, sin chat): al hacer clic muestra la explicación en un
 *   pequeño globo junto al campo.
 */
export default function FieldAlertBell({ warning, label, mode = 'chat' }) {
  const [open, setOpen] = useState(false);
  if (!warning) return null;

  const handleClick = () => {
    if (mode === 'popover') {
      setOpen((prev) => !prev);
    } else {
      window.dispatchEvent(
        new CustomEvent(ASSISTANT_ALERT_EVENT, { detail: { warnings: [warning] } }),
      );
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label ? `Posible error en ${label}. Ver detalle` : 'Posible error. Ver detalle'}
        title="CarmiBot detectó un posible error. Clic para ver el detalle."
        className="absolute -right-2.5 -top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-[0_4px_12px_-2px_rgba(217,119,6,0.5)] ring-2 ring-amber-300 transition hover:scale-110 hover:bg-amber-200"
      >
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <BellRing size={16} className="animate-pulse" />
      </button>

      {mode === 'popover' && open && (
        <div className="absolute right-0 top-9 z-30 w-64 rounded-xl border border-amber-300 bg-amber-50 p-3 shadow-[0_12px_30px_-10px_rgba(217,119,6,0.5)]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-black text-[#7c4a03]">CarmiBot detectó un posible error</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-amber-500 transition hover:text-amber-700"
              aria-label="Cerrar aviso"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-snug text-[#92510a]">
            {warning.replace(/\*\*/g, '')}
          </p>
        </div>
      )}
    </>
  );
}
