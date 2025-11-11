/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A73E8',
          dark: '#1557B0',
          light: '#E8F0FE',
        },
        accent: {
          DEFAULT: '#F4B400',
          dark: '#C49000',
        },
        text: {
          DEFAULT: '#202124',
          secondary: '#5F6368',
          muted: '#80868B',
        },
        // Alias for easier usage
        'text-primary': '#202124',
        'text-secondary': '#5F6368',
        'text-muted': '#80868B',
        success: {
          DEFAULT: '#137333',
          light: '#E6F4EA',
        },
        danger: {
          DEFAULT: '#C5221F',
          light: '#FCE8E6',
        },
        warning: {
          DEFAULT: '#EA8600',
          light: '#FEF7E0',
        },
        border: {
          DEFAULT: '#DADCE0',
          dark: '#BDC1C6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        slideDownFade: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-down-fade': 'slideDownFade 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

