/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#28A745',
          black: '#212529',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(33, 37, 41, 0.08)',
      },
    },
  },
  plugins: [],
};
