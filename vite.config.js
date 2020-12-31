const { resolve } = require('path');

module.exports = {
  root: resolve(__dirname, 'playground'),
  alias: [
    {
      find: /^\/src/,
      replacement: resolve(__dirname, 'src'),
    },
  ],
  server: {
    port: 8080,
  },
  build: {
    base: process.env.NODE_ENV === 'production' ? '/encre/' : '/',
    outDir: resolve(__dirname, 'devDist'),
  },
};
