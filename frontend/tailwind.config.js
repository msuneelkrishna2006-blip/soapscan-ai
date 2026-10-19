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
        obsidian: {
          950: '#030a0d',
          900: '#071318',
          800: '#0b1d24',
          700: '#112933',
          600: '#183744',
        },
        radiant: {
          teal: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        gold: {
          400: '#FACC15',
          500: '#D4AF37',
          600: '#B8860B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
