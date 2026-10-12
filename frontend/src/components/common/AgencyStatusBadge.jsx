import { CheckCircle2, CircleAlert } from 'lucide-react';

function AgencyStatusBadge({ active, onDark = false }) {
  const Icon = active ? CheckCircle2 : CircleAlert;
  const label = active ? 'Activa' : 'Inactiva';
  const tone = active
    ? onDark
      ? 'border-white/80 bg-white text-[#1B5E20]'
      : 'border-green-200 bg-green-50 text-green-800'
    : onDark
      ? 'border-amber-200 bg-amber-100 text-amber-950'
      : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <span
      role="status"
      aria-label={`Agencia ${label.toLowerCase()}`}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold shadow-sm ${tone}`}
    >
      <Icon size={17} strokeWidth={2.5} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default AgencyStatusBadge;
