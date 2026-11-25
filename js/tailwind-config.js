tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        display: ['Oswald', 'IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        paper: {
          50: '#faf8f3',
          100: '#f3efe6',
          200: '#e7e0d2',
          300: '#d5cbb8',
        },
        ink: {
          900: '#1c1b18',
          700: '#3f3d36',
          500: '#6b675c',
        },
        olive: {
          800: '#2f3a29',
          700: '#3f4d37',
          600: '#516347',
          100: '#e4eadf',
        },
        rust: {
          700: '#9e3223',
          600: '#b83c2b',
          100: '#f8e3df',
        }
      }
    }
  }
};