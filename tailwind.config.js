/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#090A0F',
        card: '#13161F',
        input: '#1A1E2B',
        'border-subtle': '#2A3042',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'accent-sapphire': '#3B82F6',
        'accent-focus': '#60A5FA',
        'accent-success': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        'short': { raw: '(max-height: 680px)' },
        'tall': { raw: '(min-height: 740px)' },
        'extra-tall': { raw: '(min-height: 840px)' },
      },
    },
  },
  plugins: [],
};
