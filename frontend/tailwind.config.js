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
        // Modern Service Marketplace Palette:
        // Primary Blue: #2563EB | Dark Navy: #0F172A | Background: #F8FAFC
        // Card: #FFFFFF | Accent Teal: #14B8A6 | Success: #16A34A | Text: #1E293B
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#0F172A',
          950: '#090E1A',
        },
        navy: {
          DEFAULT: '#0F172A',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        accent: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
        },
        surface: '#F8FAFC',
        success: '#16A34A',
        ink: '#1E293B',
        violet: {
          DEFAULT: '#2563EB',
          mist: '#EFF6FF',
          lilac: '#CCFBF1',
          electric: '#14B8A6',
          indigo: '#1D4ED8',
          deep: '#0F172A',
        },
      },
      backgroundImage: {
        'swatch-gradient-1': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        'swatch-gradient-2': 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
        'swatch-gradient-3': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 55%, #0F172A 100%)',
        'swatch-gradient-4': 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1D4ED8 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 14px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 12px 28px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -4px rgba(37, 99, 235, 0.08)',
        'electric': '0 8px 26px rgba(37, 99, 235, 0.25)',
        'violet': '0 8px 26px rgba(20, 184, 166, 0.25)',
      }
    },
  },
  plugins: [],
}
