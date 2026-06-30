import React from 'react';

function Card({ children, className = '', hover = false }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_14px_34px_-16px_rgba(33,37,41,0.22)] ${
        hover
          ? 'transition duration-200 hover:-translate-y-0.5 hover:border-brand-lime/60 hover:shadow-[0_2px_6px_rgba(33,37,41,0.06),0_22px_46px_-18px_rgba(33,37,41,0.28)]'
          : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}

export default Card;
