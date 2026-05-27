/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f3edff',
          100: '#e3d4ff',
          200: '#c8a9ff',
          300: '#a578ff',
          400: '#8543ff',
          500: '#5f09fe',
          600: '#4d05d6',
          700: '#3a0699',
          800: '#2a046f',
          900: '#1c0250',
          DEFAULT: '#5f09fe',
        },
        accent: '#ee8b60',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#fafafb',
          sunken: '#f5f5f7',
        },
        neutral: {
          50:  '#fafafb',
          100: '#f5f5f7',
          200: '#e7e7ec',
          300: '#d3d3db',
          400: '#a1a1ac',
          500: '#6b6b76',
          600: '#4a4a55',
          700: '#2f2f38',
          800: '#1d1d24',
          900: '#0f0f14',
        },
      },
    },
  },
  plugins: [],
};
