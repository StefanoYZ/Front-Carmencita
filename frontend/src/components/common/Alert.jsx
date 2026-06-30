import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const tones = {
  info: { box: 'border-brand-lime/60 bg-brand-surface text-brand-dark', icon: Info, iconColor: 'text-brand-green' },
  success: { box: 'border-brand-lime bg-brand-lime/20 text-brand-dark', icon: CheckCircle2, iconColor: 'text-brand-green' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
  error: { box: 'border-red-200 bg-red-50 text-red-700', icon: XCircle, iconColor: 'text-red-500' },
};

function Alert({ children, tone = 'info' }) {
  const config = tones[tone] || tones.info;
  const Icon = config.icon;
  const assertive = tone === 'error' || tone === 'warning';
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${config.box}`}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${config.iconColor}`} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default Alert;
