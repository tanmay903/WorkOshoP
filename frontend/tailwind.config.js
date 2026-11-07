/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color Palette from Attitude Creative Swatch:
        // #F2E6EE (Lavender White)
        // #FFCCF2 (Lilac Pink)
        // #977DFF (Vibrant Violet)
        // #0033FF (Electric Royal Blue)
        // #0600AB (Deep Royal Indigo)
        // #00033D (Midnight Deep Navy)
        primary: {
          DEFAULT: '#0033FF',
          50: '#F2E6EE',
          100: '#FFCCF2',
          200: '#D6C8FF',
          300: '#B69EFF',
          400: '#977DFF',
          500: '#385EFF',
          600: '#0033FF',
          700: '#0600AB',
          800: '#040082',
          900: '#00033D',
          950: '#000224',
        },
        navy: {
          DEFAULT: '#00033D',
          700: '#0A00E0',
          800: '#0600AB',
          900: '#00033D',
          950: '#000220',
        },
        violet: {
          DEFAULT: '#977DFF',
          mist: '#F2E6EE',
          lilac: '#FFCCF2',
          electric: '#977DFF',
          indigo: '#0600AB',
          deep: '#00033D',
        },
        surface: '#F8FAFC',
        success: '#10B981',
      },
      backgroundImage: {
        'swatch-gradient-1': 'linear-gradient(180deg, #F2E6EE 0%, #977DFF 100%)',
        'swatch-gradient-2': 'linear-gradient(180deg, #FFCCF2 0%, #977DFF 50%, #0033FF 100%)',
        'swatch-gradient-3': 'linear-gradient(180deg, #977DFF 0%, #0033FF 50%, #0600AB 100%)',
        'swatch-gradient-4': 'linear-gradient(180deg, #0033FF 0%, #0600AB 50%, #00033D 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 51, 255, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 25px -3px rgba(0, 51, 255, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'electric': '0 8px 30px rgba(0, 51, 255, 0.35)',
        'violet': '0 8px 30px rgba(151, 125, 255, 0.35)',
      }
    },
  },
  plugins: [],
}
