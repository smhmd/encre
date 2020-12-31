const { createServer, build } = require('vitepress');
const { resolve } = require('path');
const shell = require('shelljs');

const config = require('../vite.config');
const port = 3000;
const docConfig = Object.assign({}, config, {
  root: resolve(__dirname, '../docs'),
  server: {
    port,
  },
});
(async function () {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(docConfig);
      // dev doc
      const server = await createServer(docConfig.root, docConfig);
      server.listen(port, () => {
        console.log(`listening at http://localhost:${port}`);
      });
    } else {
      // build doc
      await build(docConfig);
      const docDir = resolve(__dirname, '../docs');
      shell.mv(resolve(docDir, './.vitepress/dist'), docDir);
      shell.cp(resolve(__dirname, '../.nojekyll'), resolve(docDir, './dist'));
      console.log('...🌟Complete🌟...');
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (process.env.NODE_ENV === 'production') {
      process.exit(0);
    }
  }
})();
