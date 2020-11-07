const shell = require('shelljs');

shell.exec('find ./__tests__ -name "__snapshots__"  | xargs rm -rf');
