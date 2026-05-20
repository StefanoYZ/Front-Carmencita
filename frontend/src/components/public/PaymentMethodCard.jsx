import React from 'react';

function PaymentMethodCard({ active, description, icon, label, onSelect, value }) {
  return (
    <button
      type="button"
      className={`flex min-h-[78px] w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition ${
        active ? 'border-[#31934F] bg-[#E3EAE1] shadow-sm' : 'border-gray-200 bg-white hover:border-[#31934F]/50 hover:bg-green-50'
      }`}
      onClick={() => onSelect(value)}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${active ? 'bg-white' : 'bg-[#E3EAE1]'}`}>
        {icon ? <img src={icon} alt="" className="h-6 w-6" /> : <span className="text-sm font-black text-[#31934F]">YA</span>}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-[#1F2937] sm:text-base">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-gray-600 sm:text-sm">{description}</span>
      </span>
    </button>
  );
}

export default PaymentMethodCard;
