/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'Arial', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
        devanagari: ['"Noto Devanagari"', '"Noto Sans"', 'sans-serif'],
      },
      colors: {
        goi: {
          navy: '#1D0A69',
          dark: '#14064a',
          saffron: '#FF9933',
          green: '#138808',
          bg: '#F3F4F6',
          border: '#CBD5E1',
          header: '#0E1B38'
        }
      }
    },
  },
  plugins: [],
}
