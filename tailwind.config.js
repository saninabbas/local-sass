/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#faf9f5',
        canvas: '#faf9f5',
        card: '#efe9de',
        border: '#e6dfd8',
        primary: {
          DEFAULT: '#141413',
          accent: '#cc785c',
          coral: '#cc785c',
          hover: '#a9583e',
          active: '#a9583e',
          disabled: '#e6dfd8',
        },
        secondary: '#6c6a64',
        muted: '#6c6a64',
        'muted-soft': '#8e8b82',
        success: '#5db872',
        warning: '#d4a017',
        danger: '#c64545',
        white: '#FFFFFF',
        // Claude Design System Tokens
        claude: {
          primary: '#cc785c',
          'primary-active': '#a9583e',
          'primary-disabled': '#e6dfd8',
          ink: '#141413',
          body: '#3d3d3a',
          'body-strong': '#252523',
          muted: '#6c6a64',
          'muted-soft': '#8e8b82',
          hairline: '#e6dfd8',
          'hairline-soft': '#ebe6df',
          canvas: '#faf9f5',
          'surface-soft': '#f5f0e8',
          'surface-card': '#efe9de',
          'surface-cream-strong': '#e8e0d2',
          'surface-dark': '#181715',
          'surface-dark-elevated': '#252320',
          'surface-dark-soft': '#1f1e1b',
          'on-primary': '#ffffff',
          'on-dark': '#faf9f5',
          'on-dark-soft': '#a09d96',
          'accent-teal': '#5db8a6',
          'accent-amber': '#e8a55a',
          'accent-success': '#5db872',
          'accent-warning': '#d4a017',
          'accent-error': '#c64545',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Copernicus', '"Tiempos Headline"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['Lora', 'Copernicus', '"Tiempos Headline"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'display-xl': '-1.5px',
        'display-lg': '-1px',
        'display-md': '-0.5px',
        'display-sm': '-0.3px',
        'caption-uppercase': '1.5px',
      }
    },
  },
  plugins: [],
}
