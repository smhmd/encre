module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('cssnano')({
      preset: [
        'default',
        {
          discardDuplicates: true,
        },
      ],
    }),
  ],
};
