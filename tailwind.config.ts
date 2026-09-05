import type { Config } from 'tailwindcss';

/**
 * Brand direction: premium Kenyan hospitality + contemporary restaurant + sophisticated
 * nightlife. Deep charcoal/near-black base, warm gold accent (brass/candlelight, not
 * neon), a deep wine/burgundy secondary for the bar side, and a warm cream for
 * light surfaces. Avoid generic SaaS blues/purples entirely.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0d0b0a',
          900: '#161311',
          800: '#221e1b',
          700: '#332c27',
          600: '#4a4038',
        },
        gold: {
          50: '#faf6ec',
          100: '#f2e8cc',
          200: '#e6d29c',
          300: '#d8b968',
          400: '#c9a043',
          500: '#b3862f', // primary accent
          600: '#8f6a24',
          700: '#6d501c',
        },
        wine: {
          50: '#fbeef0',
          100: '#f0cdd2',
          300: '#c96b78',
          500: '#8a1f2d', // bar/nightlife accent
          600: '#6f1823',
          700: '#54121a',
          900: '#2c0a0f',
        },
        cream: {
          50: '#fffdf9',
          100: '#faf4e9',
          200: '#f2e8d5',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.08em',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(13, 11, 10, 0.35)',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
