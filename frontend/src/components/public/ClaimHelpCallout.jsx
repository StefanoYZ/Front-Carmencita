import { ArrowRight, MessageSquareWarning } from 'lucide-react';
import { Link } from 'react-router-dom';

function ClaimHelpCallout() {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-[#c8dfbd] border-l-4 border-l-brand-green bg-gradient-to-r from-[#edf6e8] via-white to-[#f7fbf4] p-4 shadow-[0_8px_24px_-18px_rgba(33,37,41,0.3)] sm:p-5" aria-labelledby="claim-help-title">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green text-white shadow-sm" aria-hidden="true">
          <MessageSquareWarning size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="claim-help-title" className="text-base font-black leading-5 text-brand-dark">¿Problemas con tu encomienda?</h2>
          <p className="mt-1 text-xs leading-5 text-brand-gray">Reporta daño, retraso, pérdida o un problema de entrega.</p>
          <Link to="/reclamos" className="group mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-green px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green">
            Registrar un reclamo <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ClaimHelpCallout;
