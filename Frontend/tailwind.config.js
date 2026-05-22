/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#646cff',
        'primary-dark': '#535bf2',
        react: '#61dafb',
        'text-primary': '#213547',
        'text-secondary': '#888888',
        'bg-light': '#f9f9f9',
        amber: {
          50: '#fffaf6',
          100: '#F5E8D0',
          200: '#EAD2A8',
          300: '#C9922A',
          400: '#C8520A'
        },
        brand: {
          maroon1: '#8f1d34',
          maroon2: '#7a1024'
        }
      },
      spacing: {
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '2.5rem'
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', "'Times New Roman'", 'Times', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto']
      },
      boxShadow: {
        'soft-amber': '0 4px 18px rgba(201,146,42,0.22)',
        'heavy-maroon': '0 8px 24px rgba(122,16,36,0.25)'
      }
    },
  },
  plugins: [],
}