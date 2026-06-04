import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cway: {
          'dark-green': '#1C2B1E',   // primary bg, sidebar, navbar
          'forest': '#243825',       // secondary dark surfaces, cards
          'gold': '#C9973A',         // primary accent, CTAs, highlights
          'gold-light': '#E8B85A',   // gold hover state
          'gold-muted': '#A8792A',   // gold text on light backgrounds
          'cream': '#F5F0E8',        // light page backgrounds
          'cream-dark': '#EDE5D5',   // card surfaces on light bg
          'text-muted': '#8A9E8C',   // secondary text on dark bg
          'success': '#4A8C5C',
          'danger': '#8C3A3A',
          'warning': '#8C6A1A',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      }
    },
  },
  plugins: [],
};

export default config;
