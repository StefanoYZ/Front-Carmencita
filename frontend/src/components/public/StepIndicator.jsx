import React from 'react';

const steps = [
  { number: 1, label: 'Datos del envio' },
  { number: 2, label: 'Confirmacion y pago' },
];

function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_14px_34px_-18px_rgba(33,37,41,0.22)]">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        {steps.map((step, index) => {
          const active = currentStep === step.number;
          const done = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black transition ${
                    active || done
                      ? 'bg-gradient-to-b from-[#28A745] to-[#1f8f3a] text-white shadow-[0_6px_14px_-4px_rgba(40,167,69,0.5)]'
                      : 'bg-[#F8F9FA] text-[#3C5940] ring-1 ring-[#A3CF84]/40'
                  }`}
                >
                  {done ? '✓' : step.number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-[#6C757D]">Paso {step.number}</p>
                  <p className={`break-words text-sm font-black ${active ? 'text-[#28A745]' : 'text-[#212529]'}`}>{step.label}</p>
                </div>
              </div>
              {index === 0 && (
                <div className="hidden h-1 w-20 overflow-hidden rounded-full bg-[#F8F9FA] sm:block">
                  <div className={`h-full rounded-full bg-[#28A745] transition-all duration-500 ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
