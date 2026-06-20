/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0edff',
          100: '#e3ddff',
          400: '#a78bfa',
          500: '#7c6aff',
          600: '#6352e8',
        },
      },
      animation: {
        'slide-up': 'slideUp .3s ease',
        'spin-slow': 'spin .6s linear infinite',
      },
      keyframes: {
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
