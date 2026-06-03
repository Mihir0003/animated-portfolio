/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#05111f",
          mid: "#10263c",
          surface: "rgba(8, 20, 36, 0.68)",
        },
        accent: {
          1: "#4de4ff", // Cyan
          2: "#ff8f3f", // Orange
          3: "#34f5b3", // Mint
        },
        text: {
          primary: "#ecf4ff",
          secondary: "#b8cbe0",
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(130, 190, 240, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(130, 190, 240, 0.08) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 28px rgba(77, 228, 255, 0.25)",
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        space: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
