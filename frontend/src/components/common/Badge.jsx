import React from 'react';

const tones = {
  green: { chip: 'bg-brand-lime/25 text-brand-dark ring-brand-lime/50', dot: 'bg-brand-green' },
  gray: { chip: 'bg-brand-surface text-brand-gray ring-gray-200', dot: 'bg-brand-gray' },
  amber: { chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  red: { chip: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
};

function Badge({ children, tone = 'gray', dot = true }) {
  const config = tones[tone] || tones.gray;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${config.chip}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {children}
    </span>
  );
}

export default Badge;
