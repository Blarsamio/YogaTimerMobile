/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Ember & Clay. Clay replaces the old slate (#70798C).
        umber: '#17130F', // dark background; also labels on taupe/clay (6.7:1, 6.2:1)
        'umber-deep': '#0E0B08', // practice screen
        'surface-dark': '#221D18',
        card: '#2A231C',
        line: '#3A3128',
        ink: '#EDE4D6',
        muted: '#A89C8C',
        clay: '#C08A6A', // progress, continue, active states
        primary: {
          black: '#17130F',
          taupe: '#A99985',
        },
        white: '#FFFFFF',
        bone: '#F5F1ED',
        black: '#17130F',
        background: '#FAF7F2',
        surface: '#F5F1ED',
        accent: '#A99985', // taupe: primary buttons, timer numerals
        text: {
          primary: '#17130F',
          secondary: '#6B5E4F',
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
