const shell = require('shelljs');

shell.exec('find ./packages -name "dist"  | xargs rm -rf');
shell.exec('find ./docs -name "dist"  | xargs rm -rf');
