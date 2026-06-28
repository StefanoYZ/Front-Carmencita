import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { PersonStanding } from 'lucide-react';
import AccessibilityPanel from './AccessibilityPanel.jsx';
import {
  DEFAULT_PREFERENCES,
  applyPreferences,
  loadPreferences,
  savePreferences,
} from '../../utils/accessibilityPreferences.js';

const POSITION_KEY = 'carmencita:a11y-pos';

function loadPosition() {
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return { x: 0, y: 0 };
    const parsed = JSON.parse(raw);
    return { x: Number(parsed.x) || 0, y: Number(parsed.y) || 0 };
  } catch {
    return { x: 0, y: 0 };
  }
}

export default function AccessibilityFloatingButton() {
  const { pathname } = useLocation();
  // Solo arrastrable en vistas internas (admin, secretaria, estiba). En la vista
  // publica queda estatico en la esquina inferior izquierda.
  const isInternal = pathname.startsWith('/admin') || pathname.startsWith('/secretaria');

  const [prefs, setPrefs] = useState(loadPreferences);
  const [open, setOpen] = useState(false);
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const triggerRef = useRef(null);
  const draggedRef = useRef(false);

  const initialPos = useRef(loadPosition());
  const x = useMotionValue(initialPos.current.x);
  const y = useMotionValue(initialPos.current.y);

  // Aplica y persiste cada vez que cambian las preferencias.
  useEffect(() => {
    applyPreferences(prefs);
    savePreferences(prefs);
  }, [prefs]);

  // El boton se puede arrastrar a cualquier parte de la pantalla.
  useEffect(() => {
    const compute = () =>
      setConstraints({
        top: -(window.innerHeight - 96),
        bottom: 0,
        left: 0,
        right: window.innerWidth - 96,
      });
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const update = useCallback((partial) => setPrefs((current) => ({ ...current, ...partial })), []);
  const reset = useCallback(() => setPrefs({ ...DEFAULT_PREFERENCES }), []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const savePosition = useCallback(() => {
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [x, y]);

  const activeCount = Object.keys(DEFAULT_PREFERENCES).filter((key) => {
    if (key === 'fontScale') return prefs.fontScale !== 1;
    if (key === 'saturation') return prefs.saturation !== 'normal';
    return Boolean(prefs[key]);
  }).length;

  return createPortal(
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        drag={isInternal}
        dragMomentum={false}
        dragConstraints={isInternal ? constraints : undefined}
        style={isInternal ? { x, y } : undefined}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={() => {
          savePosition();
          window.setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        }}
        onClick={() => {
          if (draggedRef.current) return;
          setOpen((value) => !value);
        }}
        aria-label={isInternal ? 'Abrir menu de accesibilidad (se puede arrastrar para reubicar)' : 'Abrir menu de accesibilidad'}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={isInternal ? 'Accesibilidad — arrastra para mover' : 'Accesibilidad'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`fixed bottom-5 left-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1f4d2f] to-brand-dark text-white shadow-[0_10px_28px_-6px_rgba(33,37,41,0.55)] ring-2 ring-white/70 transition-colors hover:to-brand-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 sm:left-6 ${
          isInternal ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
      >
        <PersonStanding size={30} aria-hidden="true" />
        {activeCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-lime px-1 text-xs font-black text-brand-dark ring-2 ring-white"
            aria-label={`${activeCount} ajustes activos`}
          >
            {activeCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <AccessibilityPanel prefs={prefs} onUpdate={update} onReset={reset} onClose={close} />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
