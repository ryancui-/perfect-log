import babel from 'rollup-plugin-babel';

const pkg = require('../package');

const now = new Date();
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 *
 * Copyright (c) 2018-${now.getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */
`;

export default {
  input: 'src/index.js',
  output: [{
    banner,
    file: `dist/${pkg.name}.js`,
    format: 'umd',
    name: 'PerfectLog',
  }, {
    banner,
    file: `dist/${pkg.name}.common.js`,
    format: 'cjs',
  }, {
    banner,
    file: `dist/${pkg.name}.esm.js`,
    format: 'es',
  }],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    })
  ]
};
