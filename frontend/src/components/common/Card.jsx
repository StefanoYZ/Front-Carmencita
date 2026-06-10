import React from 'react';
function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 shadow-[0_10px_28px_rgba(33,37,41,0.06)] ${className}`}>
      {children}
    </section>
  );
}

export default Card;
