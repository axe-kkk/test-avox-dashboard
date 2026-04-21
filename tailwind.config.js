/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        avox: {
          50:  '#f8f7f5',
          100: '#f0ede8',
          200: '#e1dbd2',
          300: '#c8bfb0',
          400: '#a99b87',
          500: '#8c7d68',
          600: '#7a6a58',
          700: '#65584a',
          800: '#544a3f',
          900: '#463e36',
          950: '#252118',
        },
        slate: {
          25: '#fcfcfd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card': '0 1px 4px 0 rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        'panel': '0 4px 24px -4px rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
