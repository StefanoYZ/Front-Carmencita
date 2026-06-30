import React from 'react';
import { motion } from 'framer-motion';

const STATE_CONFIGS = {
  idle: {
    eyeColor: '#28A745',
    bodyColor: '#3C5940',
    labelColor: '#A3CF84',
    expression: 'smile',
  },
  greeting: {
    eyeColor: '#28A745',
    bodyColor: '#28A745',
    labelColor: '#fff',
    expression: 'wide',
  },
  thinking: {
    eyeColor: '#A3CF84',
    bodyColor: '#3C5940',
    labelColor: '#A3CF84',
    expression: 'think',
  },
  success: {
    eyeColor: '#28A745',
    bodyColor: '#3C5940',
    labelColor: '#A3CF84',
    expression: 'happy',
  },
  warning: {
    eyeColor: '#f59e0b',
    bodyColor: '#3C5940',
    labelColor: '#fde68a',
    expression: 'worry',
  },
  tracking: {
    eyeColor: '#28A745',
    bodyColor: '#1f4d2f',
    labelColor: '#A3CF84',
    expression: 'look',
  },
  pickup: {
    eyeColor: '#28A745',
    bodyColor: '#2f6b3e',
    labelColor: '#A3CF84',
    expression: 'smile',
  },
};

export default function CarmiBotSvg({ state = 'idle', size = 80 }) {
  const cfg = STATE_CONFIGS[state] || STATE_CONFIGS.idle;

  const floatAnim = {
    y: [0, -6, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  };

  const greetAnim = {
    rotate: [0, 8, -8, 8, 0],
    transition: { duration: 0.8, repeat: 2, ease: 'easeInOut' },
  };

  const thinkAnim = {
    rotate: [-2, 2, -2],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  };

  const bodyAnim = state === 'idle' || state === 'pickup' || state === 'tracking'
    ? floatAnim
    : state === 'greeting'
      ? greetAnim
      : state === 'thinking'
        ? thinkAnim
        : {};

  return (
    <motion.div animate={bodyAnim} style={{ display: 'inline-block', width: size, height: size }}>
      <svg viewBox="0 0 100 110" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Cuerpo: caja */}
        <rect x="10" y="25" width="80" height="70" rx="10" ry="10" fill={cfg.bodyColor} />

        {/* Tapa de la caja */}
        <rect x="6" y="14" width="88" height="18" rx="8" ry="8" fill={cfg.bodyColor} opacity="0.85" />
        <rect x="42" y="8" width="16" height="10" rx="4" ry="4" fill={cfg.labelColor} opacity="0.9" />

        {/* Cinta de la tapa */}
        <rect x="46" y="14" width="8" height="70" rx="3" ry="3" fill={cfg.labelColor} opacity="0.3" />
        <rect x="10" y="58" width="80" height="6" rx="3" ry="3" fill={cfg.labelColor} opacity="0.3" />

        {/* Cara — ojos */}
        {cfg.expression === 'think' ? (
          <>
            <ellipse cx="36" cy="55" rx="7" ry="5" fill={cfg.eyeColor} opacity="0.9" />
            <ellipse cx="64" cy="55" rx="7" ry="5" fill={cfg.eyeColor} opacity="0.9" />
            <ellipse cx="36" cy="55" rx="3" ry="4" fill="#fff" />
            <ellipse cx="64" cy="55" rx="3" ry="4" fill="#fff" />
          </>
        ) : (
          <>
            <ellipse cx="36" cy="55" rx="8" ry="8" fill={cfg.eyeColor} opacity="0.9" />
            <ellipse cx="64" cy="55" rx="8" ry="8" fill={cfg.eyeColor} opacity="0.9" />
            <circle cx="36" cy="55" r="4" fill="#fff" />
            <circle cx="64" cy="55" r="4" fill="#fff" />
            <circle cx="37" cy="54" r="2" fill={cfg.bodyColor} />
            <circle cx="65" cy="54" r="2" fill={cfg.bodyColor} />
          </>
        )}

        {/* Boca */}
        {cfg.expression === 'smile' || cfg.expression === 'wide' || cfg.expression === 'happy' ? (
          <path
            d={cfg.expression === 'wide' ? 'M 33 73 Q 50 85 67 73' : 'M 36 72 Q 50 80 64 72'}
            stroke="#fff"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        ) : cfg.expression === 'worry' ? (
          <path d="M 36 76 Q 50 70 64 76" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : cfg.expression === 'think' ? (
          <path d="M 38 75 Q 50 80 62 75" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
        ) : (
          <path d="M 36 72 Q 50 80 64 72" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}

        {/* Etiqueta QR en cuerpo */}
        <rect x="18" y="78" width="22" height="14" rx="3" fill={cfg.labelColor} opacity="0.9" />
        <rect x="20" y="80" width="4" height="4" rx="1" fill={cfg.bodyColor} />
        <rect x="25" y="80" width="4" height="4" rx="1" fill={cfg.bodyColor} />
        <rect x="30" y="80" width="4" height="4" rx="1" fill={cfg.bodyColor} />
        <rect x="20" y="85" width="4" height="5" rx="1" fill={cfg.bodyColor} />
        <rect x="26" y="85" width="7" height="5" rx="1" fill={cfg.bodyColor} />
        <rect x="34" y="85" width="4" height="5" rx="1" fill={cfg.bodyColor} />

        {/* Puntos de pensamiento */}
        {state === 'thinking' && (
          <>
            <motion.circle
              cx="72" cy="20" r="3" fill={cfg.labelColor}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="80" cy="14" r="4" fill={cfg.labelColor}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="90" cy="7" r="5" fill={cfg.labelColor}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            />
          </>
        )}

        {/* Check de éxito */}
        {state === 'success' && (
          <motion.path
            d="M 72 18 L 80 26 L 94 8"
            stroke="#28A745"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Alerta de warning */}
        {state === 'warning' && (
          <text x="72" y="25" fontSize="18" textAnchor="middle" fill="#f59e0b">!</text>
        )}
      </svg>
    </motion.div>
  );
}
