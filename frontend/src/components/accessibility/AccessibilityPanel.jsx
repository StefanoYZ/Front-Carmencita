import React, { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AArrowDown,
  AArrowUp,
  AlignLeft,
  Contrast,
  Droplet,
  Glasses,
  ImageOff,
  Link2,
  MousePointer2,
  MoveHorizontal,
  MoveVertical,
  Pause,
  RotateCcw,
  X,
} from 'lucide-react';
import AccessibilityOptionButton from './AccessibilityOptionButton.jsx';
import {
  decreaseFontScale,
  increaseFontScale,
  nextSaturation,
} from '../../utils/accessibilityPreferences.js';

const SATURATION_LABEL = { normal: 'Normal', low: 'Baja', grayscale: 'Grises' };

export default function AccessibilityPanel({ prefs, onUpdate, onReset, onClose }) {
  const panelRef = useRef(null);

  // Cerrar con Escape y atrapar el foco dentro del panel (Tab/Shift+Tab).
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    panelRef.current?.querySelector('button')?.focus();
  }, []);

  const fontPercent = `${Math.round((prefs.fontScale || 1) * 100)}%`;
  const fontChanged = (prefs.fontScale || 1) !== 1;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-start bg-black/30 p-4 sm:items-center"
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
        aria-labelledby="a11y-panel-title"
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#1f4d2f] to-brand-dark px-5 py-4 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">Carmencita Express</p>
            <h2 id="a11y-panel-title" className="text-lg font-black">
              Menu de accesibilidad
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menu de accesibilidad"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Cuadricula de opciones */}
        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto p-4">
          <AccessibilityOptionButton
            icon={Contrast}
            label="Contraste +"
            active={prefs.contrast}
            onClick={() => onUpdate({ contrast: !prefs.contrast })}
          />
          <AccessibilityOptionButton
            icon={Link2}
            label="Resaltar enlaces"
            active={prefs.highlightLinks}
            onClick={() => onUpdate({ highlightLinks: !prefs.highlightLinks })}
          />
          <AccessibilityOptionButton
            icon={AArrowUp}
            label="Agrandar texto"
            active={fontChanged}
            value={fontChanged ? fontPercent : undefined}
            onClick={() => onUpdate({ fontScale: increaseFontScale(prefs.fontScale) })}
          />
          <AccessibilityOptionButton
            icon={AArrowDown}
            label="Reducir texto"
            active={fontChanged}
            value={fontChanged ? fontPercent : undefined}
            onClick={() => onUpdate({ fontScale: decreaseFontScale(prefs.fontScale) })}
          />
          <AccessibilityOptionButton
            icon={MoveHorizontal}
            label="Espaciado de texto"
            active={prefs.textSpacing}
            onClick={() => onUpdate({ textSpacing: !prefs.textSpacing })}
          />
          <AccessibilityOptionButton
            icon={MoveVertical}
            label="Altura de linea"
            active={prefs.lineHeight}
            onClick={() => onUpdate({ lineHeight: !prefs.lineHeight })}
          />
          <AccessibilityOptionButton
            icon={Pause}
            label="Detener animaciones"
            active={prefs.reduceMotion}
            onClick={() => onUpdate({ reduceMotion: !prefs.reduceMotion })}
          />
          <AccessibilityOptionButton
            icon={ImageOff}
            label="Ocultar imagenes"
            active={prefs.hideImages}
            onClick={() => onUpdate({ hideImages: !prefs.hideImages })}
          />
          <AccessibilityOptionButton
            icon={Glasses}
            label="Apto para dislexia"
            active={prefs.dyslexia}
            onClick={() => onUpdate({ dyslexia: !prefs.dyslexia })}
          />
          <AccessibilityOptionButton
            icon={MousePointer2}
            label="Cursor grande"
            active={prefs.bigCursor}
            onClick={() => onUpdate({ bigCursor: !prefs.bigCursor })}
          />
          <AccessibilityOptionButton
            icon={AlignLeft}
            label="Texto alineado"
            active={prefs.alignLeft}
            onClick={() => onUpdate({ alignLeft: !prefs.alignLeft })}
          />
          <AccessibilityOptionButton
            icon={Droplet}
            label="Saturacion"
            active={prefs.saturation !== 'normal'}
            value={prefs.saturation !== 'normal' ? SATURATION_LABEL[prefs.saturation] : undefined}
            onClick={() => onUpdate({ saturation: nextSaturation(prefs.saturation) })}
          />
        </div>

        {/* Pie: restablecer */}
        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-brand-dark transition hover:border-brand-green hover:bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Restablecer accesibilidad
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
