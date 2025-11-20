/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink': {
          '50%': { borderColor: 'transparent' },
        },
        'highlight': {
          '0%': { 
            transform: 'scale(1)',
            textShadow: '0 0 0 rgba(234, 179, 8, 0)',
          },
          '50%': { 
            transform: 'scale(1.05)',
            textShadow: '0 0 20px rgba(234, 179, 8, 0.5)',
          },
          '100%': { 
            transform: 'scale(1)',
            textShadow: '0 0 0 rgba(234, 179, 8, 0)',
          },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'rotateX(5deg) rotateY(5deg)' },
          '50%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '75%': { transform: 'rotateX(-5deg) rotateY(-5deg)' },
          '100%': { transform: 'rotateX(0deg) rotateY(0deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'progress': 'progress 1s ease-out forwards',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink .75s step-end infinite',
        'highlight': 'highlight 2s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
