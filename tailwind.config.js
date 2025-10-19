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
        // Custom colors cho light mode
        primary: {
          DEFAULT: '#10b981', // green-500
          dark: '#059669', // green-600
        },
        background: '#f9fafb', // gray-50
        surface: '#ffffff', // white
        // Dark mode sẽ tự động override khi có class dark:
      },
    },
  },
  plugins: [],
}