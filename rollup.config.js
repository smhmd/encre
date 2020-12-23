const pkg = require('./package.json');
const ts = require('rollup-plugin-typescript2');
const { resolve } = require('path');
const { terser } = require('rollup-plugin-terser');

const banner = `
/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} Zhang Ziheng
 * Released under the ${pkg.license} License
 */
`.trim();
function isEsm(f) {
  return !!f && f === 'es';
}
function genRollupObj(format = 'es') {
  const plugin = format === 'es' ? [] : [terser()];
  return {
    input: resolve(__dirname, 'src/index.ts'),
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      ts({
        useTsconfigDeclarationDir: isEsm(format),
        tsconfig: resolve(__dirname, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            // target: format && format !== 'cjs' ? 'ESNEXT' : 'ES5',
            declaration: isEsm(format),
            declarationMap: isEsm(format),
            declarationDir: resolve(__dirname, './dist/temp'),
            rootDir: resolve(__dirname, 'src'),
          },
          include: [resolve(__dirname, 'src')],
          exclude: [
            '**/node_modules',
            '**/tests',
            '**/dist',
            'playground/*',
          ],
        },
      }),
      ...plugin,
    ],
    output: {
      dir: resolve(__dirname, 'dist'),
      format,
      banner: format === 'es' ? banner : '',
      name: pkg.name,
      entryFileNames: pkg.name + '.' + format + '.bundle.js',
      extend: true,
    },
  };
}

module.exports = ['es', 'umd', 'cjs'].map((f) => genRollupObj(f));
