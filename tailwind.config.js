const colors = require('tailwindcss/colors')

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      red: colors.rose,
      yellow: colors.amber,
      blue: colors.blue,
      green: colors.green,
      whaleblue: {
        light: '#0f8df4',
        DEFAULT: '#0975CE',
        dark: '#065290'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
