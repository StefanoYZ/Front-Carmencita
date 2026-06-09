import React from 'react';

export default function MetricCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="rounded-lg border border-[#E4ECE2] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`h-5 w-5 ${accent ? 'text-[#28A745]' : 'text-[#3C5940]'}`} />}
        <span className="text-xs font-bold uppercase tracking-wide text-[#6C757D]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-[#212529]">{value}</p>
    </div>
  );
}
