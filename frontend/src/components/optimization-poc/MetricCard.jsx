import React from 'react';

export default function MetricCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="group rounded-2xl border border-[#E4ECE2] bg-white p-4 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_12px_28px_-16px_rgba(33,37,41,0.22)] transition duration-200 hover:-translate-y-0.5 hover:border-[#A3CF84]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-[#6C757D]">{label}</span>
        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
              accent ? 'from-[#28A745]/15 to-[#28A745]/5 text-[#28A745]' : 'from-[#3C5940]/15 to-[#3C5940]/5 text-[#3C5940]'
            }`}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-black text-[#212529]">{value}</p>
    </div>
  );
}
