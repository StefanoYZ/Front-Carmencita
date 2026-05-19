import React from 'react';
const tones = {
  green: 'bg-green-50 text-green-700 ring-green-200',
  gray: 'bg-gray-100 text-gray-700 ring-gray-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
};

function Badge({ children, tone = 'gray' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default Badge;
