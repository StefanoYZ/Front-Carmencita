import React from 'react';
const variants = {
  primary: 'bg-brand-green text-white shadow-sm hover:bg-brand-dark focus:ring-brand-green',
  secondary: 'bg-white text-brand-black border border-gray-200 shadow-sm hover:border-brand-green hover:bg-brand-surface focus:ring-brand-lime/60',
  ghost: 'bg-transparent text-brand-gray hover:bg-brand-surface hover:text-brand-black focus:ring-brand-lime/60',
};

function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
