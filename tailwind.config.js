/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cyber: {
          bg: '#0a1628',
          panel: '#0d1a30',
          secondary: '#0f1f3d',
          accent: '#00e5a0',
          'accent-dim': '#00b37d',
          warning: '#ffc107',
          danger: '#ff3d57',
          success: '#00e676',
          border: '#1a2a4a',
          'text-dim': '#6b7c93',
        }
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flash-red': 'flash-red 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
