const { build } = require('vite/dist/node/build');
const config = require('../vite.config');

(async function () {
  try {
    await build({
      ...config,
    });
    console.log('...🌟Done🌟...')
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
