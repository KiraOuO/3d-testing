
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  mode: "jit",
  theme: {
    extend: {
      width: {
        'screen-1/2': '40vw',
      },
      colors: {
        primary: "#050816",
        secondary: "#F2542D",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      backgroundImage: {
        "mainbg": "url('/public/main_bckg.jpg')"
      },
    },
  },
  plugins: [],
};