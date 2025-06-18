// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Crucial: make sure this path covers all your files using Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}