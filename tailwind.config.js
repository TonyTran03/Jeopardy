/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { fontFamily: {
      pd: ['Playfair Display Variable', 'serif'],
    },
    colors: {
      lblue: '#A8CBD1',
      gold: '#E1D7A2',
      lred: '#E88E83',
      dred: '#BE534B',
      tiffany: '#8EE0C9',
    },
  
  
  }

    
  },
  plugins: [],
}

