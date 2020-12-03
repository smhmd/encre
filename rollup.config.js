const pkg = require('./package.json');
const ts = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { resolve } = require('path');
const { terser } = require('rollup-plugin-terser');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function genRollupObj(format = 'es') {
  const plugin = format === 'es' ? [] : [terser()];
  return {
    input: resolve(__dirname, 'src/index.ts'),
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      nodeResolve(),
      ts({
        tsconfig: resolve(__dirname, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            target: format && format !== 'cjs' ? 'ESNEXT' : 'ES5',
            declaration: format && format === 'es',
            rootDir: resolve(__dirname, 'src'),
          },
          include: [resolve(__dirname, 'src')],
          exclude: [
            '**/node_modules',
            '**/__tests__',
            '**/dist',
            'playground/*',
          ],
        },
      }),
      postcss({
        extract: format === 'es' && resolve(__dirname, 'dist/' + pkg.name + '.min.css'),
        inject: false,
        plugins: [
          autoprefixer(),
          cssnano({
            preset: [
              'default',
              {
                discardDuplicates: true,
              },
            ],
          }),
        ],
      }),
      ...plugin,
    ],
    output: {
      dir: resolve(__dirname, 'dist'),
      format,
      name: pkg.name,
      entryFileNames: pkg.name + '.' + format + '.bundle.js',
      extend: true,
    },
  };
}

module.exports = ['es', 'umd', 'cjs'].map((f) => genRollupObj(f));
