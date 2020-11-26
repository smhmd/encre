const shell = require('shelljs');

shell.rm('-rf', './dist');
shell.exec('find ./docs -name "dist"  | xargs rm -rf');
