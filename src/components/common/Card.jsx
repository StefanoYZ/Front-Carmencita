import React from 'react';
function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export default Card;
