/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        "cyan-600": "#24E5DF",
        "cyan-700": "#3DF4EF",
        "pine-50": "#F4F9F8",
        "pine-100": "#EAF2F1",
        "pine-200": "#D9E5E3",
        "pine-300": "#CAD9D7",
        "pine-400": "#B8C9C6",
        "pine-500": "#93ABA8",
        "pine-600": "#758E8C",
        "pine-700": "#597572",
        "pine-800": "#2B504C",
        "pine-900": "#133D38",
        "impact-bg": "#24E5DF",
        "impact-fg": "#123C38",
      },
      fontFamily: {
        polysans: ["var(--font-polysans)"],
        neuehaasgrotesk: ["var(--font-neuehaasgrotesk)"],
      },
    },
  },
  plugins: [],
};
