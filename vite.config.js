const path = require('path');
module.exports = {
  root: path.resolve(__dirname, './playground'),
  port: 8080,
  alias: {
    '/src/': path.resolve(__dirname, './src')
  }
}