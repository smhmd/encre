const shell = require('shelljs');
const path = require('path');
// build src/*.ts
shell.exec('rollup -c rollup.config.js');
// build css
shell.exec('lessc --clean-css src/theme/styles.less dist/styles.min.css');
shell.exec('postcss dist/styles.min.css -o dist/encre.min.css');
// rm styles.min.css
shell.rm('-rf', path.resolve(__dirname, '../dist/styles.min.css'));
// cp styles.less
shell.cp(
  '-R',
  path.resolve(__dirname, '../src/theme'),
  path.resolve(__dirname, '../dist/theme')
);
