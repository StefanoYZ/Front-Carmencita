import React from 'react';

const steps = [
  { number: 1, label: 'Datos del envio' },
  { number: 2, label: 'Confirmacion y pago' },
];

function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        {steps.map((step, index) => {
          const active = currentStep === step.number;
          const done = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    active || done ? 'bg-[#28A745] text-white' : 'bg-[#F8F9FA] text-[#3C5940]'
                  }`}
                >
                  {step.number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-gray-400">Paso {step.number}</p>
                  <p className={`break-words text-sm font-black ${active ? 'text-[#28A745]' : 'text-[#212529]'}`}>{step.label}</p>
                </div>
              </div>
              {index === 0 && <div className="hidden h-0.5 w-20 rounded-full bg-[#F8F9FA] sm:block" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
