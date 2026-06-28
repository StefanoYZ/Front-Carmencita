import React from 'react';

const variants = {
  primary:
    'bg-gradient-to-b from-brand-green to-[#1f8f3a] text-white shadow-[0_6px_16px_-4px_rgba(40,167,69,0.45)] hover:from-[#2fb850] hover:to-brand-dark hover:shadow-[0_8px_20px_-4px_rgba(40,167,69,0.5)] focus:ring-brand-green/40',
  secondary:
    'bg-white text-brand-black border border-gray-200 shadow-sm hover:border-brand-green hover:bg-brand-surface focus:ring-brand-lime/50',
  ghost:
    'bg-transparent text-brand-gray hover:bg-brand-surface hover:text-brand-black focus:ring-brand-lime/50',
  danger:
    'bg-white text-red-600 border border-red-200 shadow-sm hover:border-red-400 hover:bg-red-50 focus:ring-red-200',
};

function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
