import React from 'react';
import Badge from './Badge.jsx';

/** Insignia de fragilidad: Baja = verde, Media = amarillo, Alta = rojo. */
const FRAGILITY_MAP = {
  BAJA: { tone: 'green', label: 'Baja' },
  MEDIA: { tone: 'amber', label: 'Media' },
  ALTA: { tone: 'red', label: 'Alta' },
};

export default function FragilityBadge({ value }) {
  const key = String(value || '').trim().toUpperCase();
  const config = FRAGILITY_MAP[key];
  if (!config) return <span className="text-brand-gray">-</span>;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
