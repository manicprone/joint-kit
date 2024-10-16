const babel = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const terser = require('@rollup/plugin-terser')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/lib.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      babelrc: true
    }),
    terser()
  ],
  external: [/@babel\/runtime/]
}
