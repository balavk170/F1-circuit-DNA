/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["'Orbitron'", "sans-serif"],
        rajdhani: ["'Rajdhani'", "sans-serif"],
        mono:     ["'Share Tech Mono'", "monospace"],
      },
      colors: {
        f1red:  "#e10600",
        neon:   "#00f5ff",
        nyellow:"#f5e642",
        ngreen: "#39ff14",
        npink:  "#ff0090",
        norange:"#ff6b00",
        npurple:"#bf5fff",
        bg0:    "#03030a",
        bg1:    "#06060e",
        bg2:    "#0a0a18",
        bg3:    "#0d0d22",
      },
      boxShadow: {
        neon:  "0 0 36px rgba(0,245,255,0.07)",
        f1:    "0 0 20px rgba(225,6,0,0.5)",
      },
    },
  },
  plugins: [],
};
