const { resolve } = require('path');

module.exports = {
  root: resolve(__dirname, 'playground'),
  port: 8080,
  alias: {
    '/src/': resolve(__dirname, './src')
  }
};
