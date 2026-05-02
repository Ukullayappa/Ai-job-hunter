/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Very dark blue/black
        surface: '#1A2235', // Slightly lighter card color
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Emerald
        accent: '#8B5CF6', // Purple
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
