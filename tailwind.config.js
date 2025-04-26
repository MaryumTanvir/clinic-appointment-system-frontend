/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1D4ED8', // Blue for buttons, titles
        },
      },
    },
    plugins: [],
  }