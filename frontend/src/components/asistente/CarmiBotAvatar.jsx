/**
 * CarmiBotAvatar — renderiza el mascot CarmiBot (SVG animado con Framer Motion).
 *
 * Envoltura fina sobre CarmiBotSvg para mantener un único punto de entrada del
 * avatar en toda la app por si más adelante se cambia la implementación.
 */
import React from 'react';
import CarmiBotSvg from './CarmiBotSvg.jsx';

export default function CarmiBotAvatar({ state = 'idle', size = 80 }) {
  return <CarmiBotSvg state={state} size={size} />;
}
