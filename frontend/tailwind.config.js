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
          25: '#F6FAFF',
          50: '#EEF4FF',
          100: '#DFEAFF',
          200: '#C7DAFF',
          300: '#A7C3FF',
          400: '#7FA5FF',
          500: '#5888FF',
          600: '#3B82F6',
          700: '#2C5FCC',
          800: '#1E4399',
          900: '#152E70',
          DEFAULT: '#DFEAFF'
        },
        accent: {
          DEFAULT: '#3B82F6',
          soft: '#E4F0FF',
          vivid: '#2563EB',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#EEF1F7',
          200: '#DDE4EE',
          300: '#C4CEDC',
          400: '#9AA7BC',
          500: '#74839B',
          600: '#5B6A83',
          700: '#455066',
          800: '#303847',
          900: '#1F2530',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          tint: '#F8FAFF',
          subtle: '#F1F5FF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5F5',
          muted: '#E6EBF6',
        },
        text: {
          DEFAULT: '#1F2937',
          secondary: '#4B5563',
          muted: '#6B7280',
          subtle: '#94A3B8',
          inverted: '#F8FAFC',
        },
        success: {
          DEFAULT: '#059669',
          light: '#DCFCE7',
          dark: '#047857',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        info: '#38BDF8'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 2px 4px rgba(15, 23, 42, 0.06)',
        sm: '0 4px 12px rgba(15, 23, 42, 0.08)',
        md: '0 12px 30px -12px rgba(15, 23, 42, 0.18)',
        lg: '0 18px 40px -18px rgba(15, 23, 42, 0.22)',
        xl: '0 25px 60px -25px rgba(15, 23, 42, 0.24)',
        'soft-glow': '0 10px 20px -8px rgba(59, 130, 246, 0.35)',
        'surface': '0 16px 32px -16px rgba(15, 23, 42, 0.15)',
        'surface-strong': '0 28px 60px -28px rgba(15, 23, 42, 0.25)',
        'focus-ring': '0 0 0 4px rgba(59, 130, 246, 0.25)'
      },
      backgroundImage: {
        'body-gradient': 'linear-gradient(180deg, var(--tw-colors-surface-tint) 0%, var(--tw-colors-surface-subtle) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))'
      },
      keyframes: {
        slideDownFade: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
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

