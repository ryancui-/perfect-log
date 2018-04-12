import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const pkg = require('./package');

const now = new Date();
const banner = `/*!
 * Smart log v${pkg.version}
 * https://github.com/${pkg.repository}
 *
 * Copyright (c) 2018-${now.getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */
`;

module.exports = {
  input: 'src/index.js',
  output: [{
    banner,
    file: 'dist/smart-log.js',
    format: 'umd',
    name: 'SmartLog',
  }, {
    banner,
    file: 'dist/smart-log.common.js',
    format: 'cjs',
  }, {
    banner,
    file: 'dist/smart-log.esm.js',
    format: 'es',
  }],
  context: 'window',
  plugins: [
    resolve({
      jsnext: true,
      browser: true
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
};
