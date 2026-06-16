import React from 'react';

function Alert({ children, tone = 'info' }) {
  const tones = {
    info: 'border-brand-lime bg-brand-surface text-brand-dark',
    success: 'border-brand-lime bg-brand-lime/25 text-brand-dark',
    warning: 'border-brand-dark/30 bg-brand-surface text-brand-dark',
    error: 'border-brand-dark/40 bg-white text-brand-black',
  };

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-medium shadow-sm ${tones[tone] || tones.info}`}>
      {children}
    </div>
  );
}

export default Alert;
