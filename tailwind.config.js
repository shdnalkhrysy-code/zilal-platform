/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/app.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#07192a',
          darker: '#040d16',
          card: '#0b2236',
          cardBorder: '#173349',
          emerald: '#1cc99b',
          emeraldHover: '#16b087',
          warning: '#f5b544',
          danger: '#ff6b6b',
          tamyee: '#7cc4ff',
          textMuted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
