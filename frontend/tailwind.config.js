/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Crisp light gray
        surface: '#FFFFFF', // Pure white cards
        primary: '#2563EB', // Professional Blue
        secondary: '#059669', // Emerald Green
        accent: '#7C3AED', // Soft Purple
        grayText: '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
