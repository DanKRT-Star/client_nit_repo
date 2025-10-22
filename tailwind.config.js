/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Thêm dòng này để enable dark mode với class
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#10b981', dark: '#059669' },
        background: { DEFAULT: '#f9fafb', dark: '#0f172a' },
        surface: { DEFAULT: '#ffffff', dark: '#1f2937' },
      },
    },
  },
  plugins: [],
}