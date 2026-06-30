import React, { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import EncomiendaSummary from './EncomiendaSummary.jsx';
import { formatShipmentCode } from '../../utils/formatShipmentCode.js';

/**
 * Modal con el detalle completo de una encomienda (reutiliza EncomiendaSummary).
 * Cierra con Escape o clic en el fondo; admite acciones opcionales en el pie.
 */
export default function EncomiendaDetalleModal({ encomienda, onClose, actions }) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  if (!encomienda) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de encomienda ${formatShipmentCode(encomienda.codigo_encomienda)}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#1f4d2f] to-brand-dark px-5 py-4 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">Detalle de encomienda</p>
            <h2 className="text-lg font-black">{formatShipmentCode(encomienda.codigo_encomienda)}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto bg-brand-surface/40 p-4 sm:p-5">
          <EncomiendaSummary encomienda={encomienda} />
        </div>

        {actions && <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-white p-4">{actions}</div>}
      </motion.div>
    </motion.div>
  );
}
