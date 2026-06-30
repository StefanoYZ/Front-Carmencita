import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function buildPageList(current, total) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i += 1) {
    range.push(i);
  }
  if (range[0] > 1) {
    if (range[0] > 2) range.unshift('...');
    range.unshift(1);
  }
  if (range[range.length - 1] < total) {
    if (range[range.length - 1] < total - 1) range.push('...');
    range.push(total);
  }
  return range;
}

const NAV_BTN =
  'flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-sm font-bold text-brand-dark transition hover:border-brand-green hover:bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:cursor-not-allowed disabled:opacity-40';

export default function Pagination({ page, pageCount, onChange, label = 'Paginacion' }) {
  if (pageCount <= 1) return null;
  const pages = buildPageList(page, pageCount);

  return (
    <nav className="flex items-center gap-1.5" aria-label={label}>
      <button type="button" className={NAV_BTN} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Pagina anterior">
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      {pages.map((p, index) =>
        p === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-sm font-bold text-brand-gray" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Pagina ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? 'flex h-9 min-w-9 items-center justify-center rounded-lg bg-gradient-to-b from-brand-green to-[#1f8f3a] px-2 text-sm font-black text-white shadow-[0_6px_14px_-6px_rgba(40,167,69,0.6)]'
                : NAV_BTN
            }
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={NAV_BTN} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Pagina siguiente">
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
