module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'lavender': {
            100: '#e8e6fa', // Fond principal du chat (plus clair)
            200: '#d3cff6', // En-tête du chat (moyen)
            300: '#bcb7f2', // Bordures (plus foncé)
          },
          'yellow': {
            300: '#fff568', // Couleur des bulles de message utilisateur
          },
          'purple': {
            600: '#7036cd', // Bouton de connexion
            700: '#5c26b3', // Hover du bouton de connexion
            900: '#36169e', // Texte foncé
          }
        },
        fontFamily: {
          serif: ['"DM Serif Text"', 'serif'],
          monument: ['"PP Monument Extended"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }