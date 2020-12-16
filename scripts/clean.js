const shell = require('shelljs');

shell.rm('-rf', './dist');
shell.rm('-rf', './temp');
shell.rm('-rf', './devDist');
shell.exec('find ./docs -name "dist"  | xargs rm -rf');
