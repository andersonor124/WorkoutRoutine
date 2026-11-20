/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Fredoka"', 'system-ui', 'sans-serif'], sans: ['"Nunito"', 'system-ui', 'sans-serif'] },
      keyframes: {
        pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '80%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        flicker: { '0%,100%': { transform: 'scale(1) rotate(-2deg)' }, '50%': { transform: 'scale(1.1) rotate(2deg)' } },
        fall: { '0%': { transform: 'translateY(-10vh) rotate(0)' }, '100%': { transform: 'translateY(110vh) rotate(720deg)' } },
      },
      animation: { pop: 'pop .4s ease-out both', flicker: 'flicker 1.2s ease-in-out infinite', fall: 'fall 2.6s linear forwards' },
    },
  },
  plugins: [],
};
