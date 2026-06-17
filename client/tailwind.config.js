/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b1e",
        foreground: "#fafafa",
        primary: {
          DEFAULT: "#ccff00", // Cyber Lime
          glow: "rgba(204, 255, 0, 0.4)",
        },
        secondary: {
          DEFAULT: "#bf00ff", // Electric Purple
          glow: "rgba(191, 0, 255, 0.4)",
        },
        accent: "#00d4ff", // Tech Blue
        glass: "rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        'gradient-futuristic': "linear-gradient(135deg, #0a0b1e 0%, #1a1b3a 100%)",
      },
      boxShadow: {
        'neon-lime': "0 0 15px rgba(204, 255, 0, 0.3)",
        'neon-purple': "0 0 15px rgba(191, 0, 255, 0.3)",
        'neon-blue': "0 0 15px rgba(0, 212, 255, 0.3)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .5, filter: 'brightness(1.5)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
