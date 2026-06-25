/**
 * CarmiBotAvatar — usa Rive si está configurado, de lo contrario usa CarmiBotSvg.
 *
 * Variables de entorno opcionales para Rive:
 *   VITE_RIVE_CARMIBOT_SRC
 *   VITE_RIVE_CARMIBOT_ARTBOARD
 *   VITE_RIVE_CARMIBOT_STATE_MACHINE
 */
import React, { lazy, Suspense } from 'react';
import CarmiBotSvg from './CarmiBotSvg.jsx';

const RIVE_SRC = import.meta.env.VITE_RIVE_CARMIBOT_SRC || null;

// Si hay Rive configurado, importar dinámicamente el componente Rive
const RivePlayer = RIVE_SRC
  ? lazy(() => import('./CarmiBotRive.jsx').catch(() => ({ default: null })))
  : null;

export default function CarmiBotAvatar({ state = 'idle', size = 80 }) {
  if (RIVE_SRC && RivePlayer) {
    return (
      <Suspense fallback={<CarmiBotSvg state={state} size={size} />}>
        <RivePlayer state={state} size={size} src={RIVE_SRC} />
      </Suspense>
    );
  }
  return <CarmiBotSvg state={state} size={size} />;
}
