/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette from requirements
        primary: '#62A5BF',      // Calm blue
        secondary: '#9B7E6B',    // Earth color
        accent: '#F4A261',       // Soft orange
        background: '#F8F3E6',   // Off-white
        textDark: '#2C3E50',     // Dark blue for text
        
        // Additional HSP-friendly palette
        neutral: {
          100: '#F8F3E6',
          200: '#EFE8D9',
          300: '#E6DCC8',
          400: '#D8CDB3',
          500: '#C1B498',
          600: '#A49A82',
          700: '#877F6B',
          800: '#5C5548',
          900: '#3A352D',
        },
        
        // UI states
        success: '#7FB685',      // Soft green
        warning: '#EFC88B',      // Soft yellow
        error: '#E57373',        // Soft red
        info: '#90CAF9',         // Soft blue
      },
      fontFamily: {
        sans: ['NotoSansJP-Regular', 'sans-serif'],
        medium: ['NotoSansJP-Medium', 'sans-serif'],
      },
      spacing: {
        // Custom spacing for consistent layout
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },
    },
  },
  plugins: [],
}
