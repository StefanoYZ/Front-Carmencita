/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#28A745',
          black: '#212529',
          dark: '#3C5940',
          surface: '#F8F9FA',
          gray: '#6C757D',
          lime: '#A3CF84',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(33, 37, 41, 0.08)',
      },
    },
  },
  plugins: [],
};
