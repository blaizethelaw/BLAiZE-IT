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
        'nebula-pulse': 'nebula-pulse 3s ease-in-out infinite',
        'nebula-float': 'nebula-float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        'nebula-pulse': {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.1)',
          },
        },
        'nebula-float': {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '33%': {
            transform: 'translateY(-10px) translateX(5px)',
          },
          '66%': {
            transform: 'translateY(5px) translateX(-5px)',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(77, 153, 0, 0.5), 0 0 40px rgba(77, 153, 0, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(77, 153, 0, 0.7), 0 0 60px rgba(77, 153, 0, 0.4)',
          },
        },
        'gradient-shift': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
};
