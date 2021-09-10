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
      almostblack :{
        DEFAULT: '#31302E'
      },
      offwhite: {
        DEFAULT: '#FBF6F3'
      },
      ripeyellow: {
        DEFAULT: '#FFC802'
      },
      tomatored: {
        DEFAULT: '#FF5E43'
      },
      whaleblue: {
        light: '#0f8df4',
        DEFAULT: '#0975CE',
        dark: '#065290'
      },
      breezyblue: {
        light: '#F1F9F9',
        DEFAULT: '#C9E9EA'
      },
      turquoise: {
        DEFAULT: '#6ACEA5'
      },
    },
    borderWidth: {
      DEFAULT: '1px',
      '0': '0px',
      '2': '2px',
      '4': '4px',
      '6': '6px',
      '8': '6px',
      '10': '10px',
      '15': '15px',
      '20': '20px',
      '25': '25px'
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.03), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.03)',
      '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.03)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      none: 'none',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
