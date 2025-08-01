// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'blaize-green': '#4D9900', // Deep, logo-matching green
        'blaize-orange': '#FF8400', // Logo orange
        'blaize-slate': '#181c20', // True dark slate background
        'blaize-dark': '#0a0a0a', // Dark background for sections
        'blaize-yellow': '#ffd400', // Bright accent yellow
      },
      dropShadow: {
        glow: '0 0 16px #4D9900cc', // Subtle green glow
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
};
