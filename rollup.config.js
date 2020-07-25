import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve' // node_modules
// import typescript from '@rollup/plugin-typescript' // TypeScript
import commonjs from '@rollup/plugin-commonjs' // CommonJSモジュールをES6に変換
import babel from '@rollup/plugin-babel' // Babel
import { terser } from 'rollup-plugin-terser' // JS minfy
import pkg from './package.json'
import camelCase from 'lodash.camelcase'
import upperFirst from 'lodash.upperfirst'

// Scopeを除去する
const moduleName = upperFirst(camelCase(pkg.name.replace(/^@.*\//, '')))

// ライブラリに埋め込むcopyright
const banner = `/*!
  ${moduleName}.js v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`

export default {
  input: 'src/js/index.js',
  output: [
    {
      file: 'dist/js/script-build.js',
      format: 'iife',
      name: moduleName,
      sourcemap: 'inline',
      banner
    },
    {
      file: 'dist/js/script.js',
      format: 'iife',
      name: moduleName,
      banner,
      plugins: [terser({
        output: {
          comments: function (node, comment) {
            var text = comment.value
            var type = comment.type
            if (type === 'comment2') {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(text)
            }
          }
        }
      })]
    }
  ],
  external: [...Object.keys(pkg.devDependencies || {})], // 開発用モジュールは含めない
  plugins: [
    json(),
    nodeResolve(),
    // typescript(),
    commonjs({ extensions: ['.ts', '.js'] }),
    babel({
      babelHelpers: 'runtime', // 'bundled' | 'runtime' | 'inline' | 'external'
      exclude: 'node_modules/**'
    })
  ]
}
