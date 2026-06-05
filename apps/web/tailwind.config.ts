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
          'dark-green': '#1A261D',   // updated to deep forest
          'forest': '#2C4A3B',       // updated to mid forest
          'gold': '#B88645',         // updated to gold primary
          'gold-light': '#D4A35B',   
          'gold-muted': '#8A6432',   
          'cream': '#FAFAF7',        // updated to cream base
          'cream-dark': '#EAECE4',   
          'text-muted': '#526658',   
          'success': '#3D7A4B',
          'danger': '#B03A2E',
          'warning': '#C47D11',
          'light-bg': '#FAFAF7',
          'light-alt': '#F3F4F0',
          'light-border': '#DCE0D5'
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
