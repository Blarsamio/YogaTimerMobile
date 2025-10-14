/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary colors from your design system
        primary: {
          black: '#1C1C1C',
          'blue-gray': '#6B7280', // The blue-gray from your palette
          white: '#FFFFFF',
          cream: '#F5F5F5', // Light cream/beige
          taupe: '#A99985', // The brown/taupe color
        },
        // Legacy colors (keeping for backward compatibility)
        white: '#FFFFFF',
        bone: '#F5F1ED',
        gold: '#A99985',
        blue: '#70798C',
        black: '#1C1C1C',
        // New semantic colors
        background: '#FFFFFF',
        surface: '#F5F5F5',
        accent: '#A99985',
        text: {
          primary: '#1C1C1C',
          secondary: '#6B7280',
        }
      },
      fontFamily: {
        // Header font - ZenAntique via expo-google-fonts
        zen: ['ZenAntiqueSoft_400Regular', 'Zen Antique Soft', 'serif'],
        'zen-bold': ['ZenAntiqueSoft_400Regular', 'Zen Antique Soft', 'serif'],
        // Body font - system sans-serif fonts
        ubuntu: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'ubuntu-medium': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'ubuntu-bold': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Display sizes for hero/landing content
        'display-xl': ['56px', { lineHeight: '64px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '400' }],
        'display-md': ['40px', { lineHeight: '48px', fontWeight: '400' }],

        // Traditional heading sizes
        'h1': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '400' }],
        'h4': ['18px', { lineHeight: '24px', fontWeight: '400' }],

        // Body text sizes
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'button': '24px', // For your rounded buttons
        'circle': '50%', // For circular elements like back button
      },
      spacing: {
        'button-x': '24px', // Horizontal button padding
        'button-y': '12px', // Vertical button padding
      }
    },
  },
  plugins: [],
};
