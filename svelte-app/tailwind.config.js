/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme (default)
        'light-primary': '#4CAF50',
        'light-bg': '#f8f8f8',
        'light-surface': '#ffffff',
        'light-text': '#333333',
        'light-secondary': '#777777',
        'light-border': '#eeeeee',
        'light-hover': '#e8e8e8',
        'light-accent': '#45a049',
        
        // Dark theme
        'dark-primary': '#5CDA60',
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-text': '#E0E0E0',
        'dark-secondary': '#A0A0A0',
        'dark-border': '#2C2C2C',
        'dark-hover': '#2A2A2A',
        'dark-accent': '#6CEB70',
        
        // Super dark theme
        'superdark-primary': '#00E676',
        'superdark-bg': '#000000',
        'superdark-surface': '#0A0A0A',
        'superdark-text': '#FFFFFF',
        'superdark-secondary': '#AAAAAA',
        'superdark-border': '#1A1A1A',
        'superdark-hover': '#151515',
        'superdark-accent': '#00FF85',
        
        // Pink theme
        'pink-primary': '#FF4081',
        'pink-bg': '#FFF0F6',
        'pink-surface': '#FFFFFF',
        'pink-text': '#442C2E',
        'pink-secondary': '#AA7C80',
        'pink-border': '#FFDCEA',
        'pink-hover': '#FFE6F3',
        'pink-accent': '#FF80AB',
      }
    },
  },
  plugins: [],
}; 