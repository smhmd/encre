const { build, resolveConfig } = require('vitepress');
const { createVitePressPlugin } = require('vitepress/dist/node/plugin');
const { createServer } = require('vite');
const { resolve } = require('path');
const shell = require('shelljs');
const port = 3000;
const options = {
  root: resolve(__dirname, '../docs'),
};
(async function () {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('... start doc serving ...');
      // dev doc
      const config = await resolveConfig(options.root);
      const site = config.site;
      const server = await createServer({
        root: options.root,
        plugins: [
          ...createVitePressPlugin(options.root, config),
          {
            config() {
              return {
                define: {
                  __CARBON__: !!site.themeConfig.carbonAds?.carbon,
                  __BSA__: !!site.themeConfig.carbonAds?.custom,
                  __ALGOLIA__: !!site.themeConfig.algolia,
                },
              };
            },
          },
        ],
        server: {
          port,
        },
      });
      server.listen(port, () => {
        console.log(`listening at http://localhost:${port}`);
      });
    } else {
      // build doc
      await build(docConfig.root);
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
