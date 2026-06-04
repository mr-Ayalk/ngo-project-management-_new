/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this content array to match your project's file locations
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ENA Brand Colors — use as `text-ena-primary`, `bg-ena-primary` etc.
        'ena': {
          primary:       '#1273de',
          'primary-dark':'#0f60c2',
          'primary-light':'#e8f1fd',
        },
      },
      fontFamily: {
        // ENA uses Inter as default sans-serif
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 36s linear infinite',
        'float':   'float 8s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-15px)' },
        },
      },
      maxWidth: {
        'ena': '1400px',
      },
    },
  },
  plugins: [],
}
