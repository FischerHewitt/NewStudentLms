import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luminous Intelligence surface tiers
        surface: '#fcf8fa',
        'surface-dim': '#dcd9db',
        'surface-bright': '#fcf8fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3f5',
        'surface-container': '#f0edef',
        'surface-container-high': '#eae7e9',
        'surface-container-highest': '#e4e2e4',
        'surface-variant': '#e4e2e4',
        'surface-subtle': '#F8FAFC',
        // On-surface
        'on-surface': '#1b1b1d',
        'on-surface-variant': '#45464d',
        'inverse-surface': '#303032',
        'inverse-on-surface': '#f3f0f2',
        // Outline
        outline: '#76777d',
        'outline-variant': '#c6c6cd',
        // Primary (deep slate)
        'on-primary': '#ffffff',
        'primary-container': '#131b2e',
        'on-primary-container': '#7c839b',
        'inverse-primary': '#bec6e0',
        // Secondary (sunrise orange)
        secondary: '#9d4300',
        'on-secondary': '#ffffff',
        'secondary-container': '#fd761a',
        'on-secondary-container': '#5c2400',
        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        // Alumos brand
        'alumos-purple': '#7C3AED',
        'alumos-pink': '#EC4899',
        'alumos-orange': '#F59E0B',
        'success-green': '#10B981',
        'warning-yellow': '#FBBF24',
      },
      fontFamily: {
        hanken: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        geist: ['var(--font-geist)', 'monospace'],
        sans: ['var(--font-inter)', 'var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-hanken)', 'var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
}

export default config
