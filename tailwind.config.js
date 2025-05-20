/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
         colors: {
        'edag-dark-grey': '#455561',
        'white': '#ffffff',
        'red': '#d71946',
        'grey': '#949ca3',
        'light-grey': '#e4e5e6',
        'brown': '#b8aca5',
        'beige': '#d8cfc9',
        },
        fontFamily: {
          sans: ['hind regular', 'Arial'],
        },
        boxShadow: {
          'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  };