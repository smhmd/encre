const { resolve } = require('path');
const { readdirSync, readFileSync } = require('fs');
const packages = resolve(__dirname, 'packages');
const packagesDirs = readdirSync(packages);

const alias = {},
  regs = [];
for (let next of packagesDirs) {
  const pkg = readFileSync(resolve(packages, next, 'package.json'), {
    encoding: 'utf-8',
  });
  if (!pkg) continue;
  const name = JSON.parse(pkg).name;
  regs.push(new RegExp('("' + name + '")'));
  alias[`/${name}/`] = resolve(__dirname, 'packages/' + next);
}

module.exports = {
  root: resolve(__dirname, 'playground'),
  port: 8080,
  alias,
  transforms: [
    {
      test: (ctx) => {
        return !ctx.path.match(/node_modules/);
      },
      transform: function (ctx) {
        let code = ctx.code;

        for (let reg of regs) {
          code = code.replace(
            reg,
            '"/' + reg.source.replace(/["\\\(\)]/g, '') + '/src/index"'
          );
        }
        return code;
      },
    },
  ],
};
