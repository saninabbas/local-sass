/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        primary: {
          DEFAULT: '#0F172A',
          accent: '#2563EB',
        },
        secondary: '#64748B',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
