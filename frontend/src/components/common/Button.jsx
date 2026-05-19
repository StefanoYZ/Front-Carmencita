import React from 'react';
const variants = {
  primary: 'bg-brand-green text-white hover:bg-green-700 focus:ring-brand-green',
  secondary: 'bg-white text-brand-black border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
};

function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
