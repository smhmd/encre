const { resolve } = require('path');

module.exports = {
  root: resolve(__dirname, 'playground'),
  port: 8080,
  alias: {
    '/src/': resolve(__dirname, './src')
  },
  base: process.env.NODE_ENV === 'production' ? '/encre/' : '/',
  outDir: resolve(__dirname, 'devDist')
};
