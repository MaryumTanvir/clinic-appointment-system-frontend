/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a4d6ed', // Main light blue
        'primary-dark': '#8bc3dd', // Darker shade for hover
        accent: '#091840', // Dark navy for text, borders
      },
    },
  },
  plugins: [],
}