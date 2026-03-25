/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/*.js"],
  theme: {
    extend: {
      fontFamily: {
          sans: ['Inter', 'sans-serif'],
          manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
          'wood': {
              900: '#7c2d12',
              800: '#9a3412',
              50: '#fff7ed',
          },
          'deep-dark': '#050505',
          'gray-dark': '#1a1a1a',
          'gray-light': '#f9fafb'
      }
    }
  },
  plugins: [],
}
