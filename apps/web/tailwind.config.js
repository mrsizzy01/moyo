/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        moyo: {
          dark: '#0B0D13',
          card: '#131722',
          border: '#23293B',
          accent: '#FF4E00', // Vibrant Moyo flame orange
          violet: '#7928CA',
          cyan: '#00F0FF',
          text: '#F3F4F6',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
