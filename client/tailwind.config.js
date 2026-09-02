/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        salon: {
          bg: '#0B0F17',
          surface: '#121826',
          card: '#182032',
          border: '#243048',
          gold: '#E5B869',
          goldLight: '#F5D396',
          goldDark: '#B88836',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
          sky: '#0EA5E9',
          purple: '#A855F7'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(229, 184, 105, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
