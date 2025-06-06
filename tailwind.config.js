/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        matrix: {
          bg: '#0a0f14',
          green: '#00ff41',
          blue: '#0ff',
          pink: '#ff00ff',
        },
      },
      fontFamily: {
        cyber: ['Courier New', 'monospace'],
      },
      animation: {
        'matrix-rain': 'matrix 1s linear infinite',
        'glitch': 'glitch 1s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}