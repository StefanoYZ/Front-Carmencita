import React from 'react';
import editIcon from '../../assets/icons/lapiz.svg';

function SummaryRow({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#1F2937]">{value || '-'}</p>
    </div>
  );
}

function ShipmentSummaryCard({ title, items, onEdit }) {
  return (
    <section className="h-fit min-w-0 self-start rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-black text-[#1F2937]">{title}</h3>
        {onEdit && (
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white transition hover:bg-green-50"
            onClick={onEdit}
            aria-label={`Editar ${title}`}
            title={`Editar ${title}`}
          >
            <img src={editIcon} alt="" className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <SummaryRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

export default ShipmentSummaryCard;
