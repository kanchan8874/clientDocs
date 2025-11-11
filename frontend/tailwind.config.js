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
          dark: '#0B4D23',
        },
        danger: {
          DEFAULT: '#C5221F',
          light: '#FCE8E6',
          dark: '#9E1B19',
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
        'xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'sm': '0 2px 4px -2px rgba(15, 23, 42, 0.08), 0 1px 3px -1px rgba(15, 23, 42, 0.06)',
        'md': '0 5px 10px -6px rgba(15, 23, 42, 0.12), 0 2px 6px -4px rgba(15, 23, 42, 0.05)',
        'lg': '0 10px 18px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -6px rgba(15, 23, 42, 0.06)',
        'xl': '0 16px 26px -12px rgba(15, 23, 42, 0.14), 0 8px 12px -10px rgba(15, 23, 42, 0.08)',
        'surface': '0 16px 32px -22px rgba(15, 23, 42, 0.16)',
        'surface-strong': '0 22px 42px -25px rgba(15, 23, 42, 0.2)',
        'soft-glow': '0 24px 48px -28px rgba(59, 130, 246, 0.18)',
        'focus-ring': '0 0 0 4px rgba(26, 115, 232, 0.18)'
      },
      backgroundImage: {
        'body-gradient': 'linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(241,245,249,1) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(244,247,252,0.96), rgba(255,255,255,0.96))'
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

