import React from 'react';
const tones = {
  green: 'bg-brand-lime/35 text-brand-dark ring-brand-lime/70',
  gray: 'bg-brand-surface text-brand-gray ring-gray-200',
  amber: 'bg-brand-lime/20 text-brand-dark ring-brand-lime/60',
  red: 'bg-brand-surface text-brand-black ring-brand-gray/30',
};

function Badge({ children, tone = 'gray' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

export default Badge;
