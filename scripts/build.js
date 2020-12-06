const shell = require('shelljs');
const path = require('path');
const {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} = require('@microsoft/api-extractor');
// build src/*.ts
shell.exec('rollup -c rollup.config.js');
// use api-extractor to stitches *.d.ts
const apiExtractorJsonPath = path.join(__dirname, '../api-extractor.json');

// Load and parse the api-extractor.json file
const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

// Invoke API Extractor
const extractorResult = Extractor.invoke(extractorConfig, {
  // Equivalent to the "--local" command-line parameter
  localBuild: true,

  // Equivalent to the "--verbose" command-line parameter
  showVerboseMessages: true
});

if (extractorResult.succeeded) {
  console.log(`API Extractor completed successfully`);
  process.exitCode = 0;
} else {
  console.error(`API Extractor completed with ${extractorResult.errorCount} errors`
    + ` and ${extractorResult.warningCount} warnings`);
  process.exitCode = 1;
}
// build css
shell.exec('lessc --clean-css src/theme/styles.less dist/styles.min.css');
shell.exec('postcss dist/styles.min.css -o dist/encre.min.css');
// rm styles.min.css
shell.rm('-rf', path.resolve(__dirname, '../dist/styles.min.css'));
// rm temp declaratuion folders
shell.rm('-rf', path.resolve(__dirname, '../dist/temp'));

// cp styles.less
shell.cp(
  '-R',
  path.resolve(__dirname, '../src/theme'),
  path.resolve(__dirname, '../dist/theme')
);
