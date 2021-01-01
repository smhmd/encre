const viteConfig = require('../../vite.config');

module.exports = {
  title: 'Encre',
  decription: 'Encre',
  alias: viteConfig.alias.reduce((prev, next) => {
    prev[next.find] = next.replacement;
    return prev;
  }, {}),
  base: process.env.NODE_ENV === 'production' ? '/encre/' : '/',
  themeConfig: {
    repo: 'zzh97228/encre',
    nav: [
      { text: 'Guide', link: '/guide/index' },
      { text: 'Demo', link: '/demo/index' },
    ],
  },
};
