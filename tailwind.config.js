/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily : {
      'funhouse': ['funhouse', 'sans-serif'],
    },
    backgroundImage :{
        'bg-tramboory': "url('../src/img/background-noblur.jpeg')",
        'bg-tramboory-video' : "url('../src/videos/background.webm')",
    },
    extend: {},
  },
  plugins: [],
}