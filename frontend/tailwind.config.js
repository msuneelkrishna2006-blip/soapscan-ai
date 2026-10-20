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
          950: '#030a0f',
          900: '#061a23',
          800: '#081c26',
          700: '#112933',
          600: '#183744',
        },
        abyssal: {
          950: '#030A0F',
          900: '#061A23',
          800: '#081C26',
        },
        radiant: {
          teal: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        neon: {
          cyan: '#00F5D4',
          emerald: '#10B981',
          gold: '#F59E0B',
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
