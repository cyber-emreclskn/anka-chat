/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'discord-dark': '#202225',
        'discord-sidebar': '#2f3136',
        'discord-main': '#36393f',
        'discord-light': '#40444b',
        'discord-lightest': '#dcddde',
        'discord-accent': '#5865f2',
      },
    },
  },
  plugins: [],
}
