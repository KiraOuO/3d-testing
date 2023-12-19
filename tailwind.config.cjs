/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  mode: "jit",
  theme: {
    extend: {
      backgroundImage: {
        "mainbg": "url('/public/main_bckg.jpg')"
      },
    },
  },
  plugins: [],
};