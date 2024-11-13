/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '0.9375rem', // 15px
        'lg': '1rem',        // 16px
        'xl': '1.125rem',    // 18px
        '2xl': '1.25rem',    // 20px
        '3xl': '1.5rem',     // 24px
        '4xl': '1.875rem',   // 30px
        '5xl': '2.25rem',    // 36px
        '6xl': '3rem',       // 48px
      },

      fontFamily: {
       funhouse : ['"Funhouse"', 'cursive'],
        'sans': ['"Vazirmatn"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}