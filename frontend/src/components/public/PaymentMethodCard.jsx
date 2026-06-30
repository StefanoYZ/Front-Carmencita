import React from 'react';

function PaymentMethodCard({ active, description, icon, label, onSelect, value }) {
  return (
    <button
      type="button"
      className={`flex min-h-[78px] w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition duration-200 ${
        active
          ? 'border-[#28A745] bg-[#E4ECE2] shadow-[0_10px_24px_-12px_rgba(40,167,69,0.5)]'
          : 'border-[#E4ECE2] bg-white hover:-translate-y-0.5 hover:border-[#28A745]/50 hover:bg-[#F8F9FA]'
      }`}
      onClick={() => onSelect(value)}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-[#A3CF84]/40 ${active ? 'bg-white' : 'bg-[#F8F9FA]'}`}>
        {icon ? <img src={icon} alt="" className="h-6 w-6" /> : <span className="text-sm font-black text-[#28A745]">YA</span>}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-[#212529] sm:text-base">{label}</span>
        <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#6C757D] sm:text-sm">{description}</span>
      </span>
    </button>
  );
}

export default PaymentMethodCard;
