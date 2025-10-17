/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This line is updated to use the new package
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;