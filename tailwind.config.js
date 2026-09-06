/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#641B2E',
          50: '#FDF7F8',
          100: '#FAF0F2',
          200: '#F3DAE0',
          300: '#E4B4C0',
          400: '#D08598',
          500: '#B6546D',
          600: '#94334B',
          700: '#7C253B',
          800: '#641B2E',
          900: '#4A1221',
          950: '#320B15',
        },
        gold: {
          DEFAULT: '#D6B36A',
          light: '#EED9A7',
          dark: '#B08B3E',
          50: '#FBF8EF',
          100: '#F7F0DB',
          200: '#EED9A7',
          300: '#E6C87C',
          400: '#DEB953',
          500: '#D6B36A',
          600: '#C29A44',
          700: '#9B782E',
          800: '#795B26',
          900: '#5F4622',
        },
        ivory: {
          DEFAULT: '#FAF7F0',
          dark: '#F0EAD9',
          light: '#FFFDF9',
        },
        charcoal: {
          DEFAULT: '#292524',
          light: '#44403C',
          muted: '#78716C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(214, 179, 106, 0.25)',
        'burgundy-glow': '0 0 20px rgba(100, 27, 46, 0.25)',
        'luxury': '0 10px 30px -5px rgba(41, 37, 36, 0.08)',
      }
    },
  },
  plugins: [],
}
