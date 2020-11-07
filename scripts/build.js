const { rollup } = require('rollup');
const { resolve } = require('path');
const alias = require('@rollup/plugin-alias');
const { terser } = require('rollup-plugin-terser');
const ts = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { readdirSync, readFileSync } = require('fs');
const shell = require('shelljs');

const FORMATS = ['es', 'umd', 'cjs'];
function genRollupObj(packageDir, pkg, format) {
  const name = String(pkg.name || '').replace(/(@lagabu\/)/, '');
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  /**
   * devDependencies中的相对依赖转为alias
   */
  const devDep = Object.keys(pkg.devDependencies || {}).reduce((prev, next) => {
    if (next.match(/(@lagabu\/encre)/)) {
      prev[next] = resolve(
        __dirname,
        '../packages/' + next.replace(/(@lagabu\/)/, '')
      );
    }
    return prev;
  }, {});

  return {
    input: {
      input: resolve(packageDir, 'src/index.ts'),
      external: externals,
      plugins: [
        alias({
          entries: devDep,
        }),
        nodeResolve(),
        ts({
          tsconfig: resolve(__dirname, '../tsconfig.json'),
          tsconfigOverride: {
            compilerOptions: {
              declaration: format && format === 'es',
              rootDir: resolve(__dirname, '../packages'),
            },
            include: [resolve(packageDir)],
            exclude: [
              '**/node_modules',
              '**/__tests__',
              '**/dist',
              'playground/*',
            ],
          },
        }),
        terser(),
      ],
    },
    output: {
      dir: resolve(packageDir, 'dist'),
      format,
      name,
      globals: externals.reduce((prev, next) => {
        if (next.match(/^(@lagabu\/.*)$/)) {
          prev[`${next}`] = next;
        } else {
          prev[next] = next;
        }
        return prev;
      }, {}),
      entryFileNames: name + '.' + format + '.bundle.js',
      extend: true,
    },
  };
}

(async function () {
  const pkg = process.argv[2];
  if (!pkg) return console.log('...No Package Specified...');
  const pkgFolder = readdirSync(resolve(__dirname, '../packages'));
  if (!pkgFolder.includes(pkg)) return console.error('...No Such Package...');
  const pkgDir = resolve(__dirname, '../packages/' + pkg);
  let pkgJson = readFileSync(resolve(pkgDir, 'package.json'), {
    encoding: 'utf-8',
  });
  if (!pkgJson) return console.error('...No package.json specified...');
  pkgJson = JSON.parse(pkgJson);
  console.log('... Start ...');
  try {
    for (let f of FORMATS) {
      console.log(`... Building ${f} Type ...`);
      const { input, output } = genRollupObj(pkgDir, pkgJson, f);
      const bundle = await rollup(input);
      await bundle.write(output);
    }
    console.log('...Moving Types...');
    shell.mv(
      resolve(pkgDir, 'dist/' + pkg + '/src/*'),
      resolve(pkgDir, 'dist')
    );
    shell.rm('-rf', resolve(pkgDir, 'dist/' + pkg));
    console.log('...🌟Complete🌟...');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(0);
  }
})();
