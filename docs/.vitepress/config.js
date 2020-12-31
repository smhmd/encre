module.exports = {
  title: 'Encre',
  decription: 'Encre',
  base: process.env.NODE_ENV === 'production' ? '/encre/' : '/',
  themeConfig: {
    repo: 'zzh97228/encre',
    nav: [
      { text: 'Guide', link: '/guide/index' },
      { text: 'Demo', link: '/demo/index' },
    ],
  },
};
