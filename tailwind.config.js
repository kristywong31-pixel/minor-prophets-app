/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFBF0",
        card: "#FFFFFF",
        coffee: "#4A3B32",
        mocha: "#8C7B70",
        "accent-bread": "#D4A373",
        "accent-green": "#A8C6A3",
        "bg-nav": "#3E3632",
      },
    },
  },
  plugins: [],
}