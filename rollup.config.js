const ts = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');

const { resolve } = require('path');
const pkg = require('./package.json');
const FORMATS = ['es', 'umd', 'cjs'];
function genOutputs(format) {
  const plugins = [];
  if (format === 'cjs') {
    plugins.push(commonjs());
  }
  return {
    input: resolve(__dirname, 'src/index.ts'),
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
    ],
    plugins: [
      ...plugins,
      nodeResolve(),
      alias({
        entries: { src: resolve(__dirname, './src') },
      }),
      ts({
        tsconfig: resolve(__dirname, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            declaration: format && format === 'es',
          },
          include: ['src'],
          exclude: ['**/node_modules', '**/__tests__', '**/dist'],
        },
      }),
    ],
    output: {
      dir: resolve(__dirname, 'dist'),
      format,
      name: pkg.name,
      globals: {
        vue: 'vue',
        '@lagabu/tool': '@lagabu/tool',
      },
      entryFileNames: pkg.name + '.' + format + '.bundle.js',
      extend: true,
    },
  };
}

module.exports = FORMATS.map((f) => {
  return genOutputs(f);
});
