import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve' // node_modules
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript' // TypeScript
import commonjs from '@rollup/plugin-commonjs' // CommonJSモジュールをES6に変換
import babel from '@rollup/plugin-babel' // Babel
import { terser } from 'rollup-plugin-terser' // JS minfy
import pkg from './package.json'
import camelCase from 'lodash.camelcase'
import upperFirst from 'lodash.upperfirst'

// Scopeを除去する
const moduleName = upperFirst(camelCase(pkg.name.replace(/^@.*\//, '')))
const fileName = 'main.js'

// ライブラリに埋め込むcopyright
const banner = `/*!
  ${moduleName}.js v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`

export default {
  input: 'src/js/main.ts',
  output: [
    {
      file: 'dist/wordpress/wp-content/themes/minamiaso/assets/js/' + fileName,
      format: 'iife',
      name: 'APPS', // moduleName
      // sourcemap: 'inline',
      banner
    },
    {
      file: 'dist/wordpress/wp-content/themes/minamiaso/assets/js/' + fileName,
      format: 'iife',
      name: 'APPS', // moduleName
      // banner,
      plugins: [
        terser({
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
        })
      ]
    }
  ],
  external: [...Object.keys(pkg.devDependencies || {})], // 開発用モジュールは含めない
  plugins: [
    json(),
    nodeResolve({
      browser: true
    }),
    typescript(),
    commonjs({ extensions: ['.ts', '.js'] }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({
      babelHelpers: 'runtime', // 'bundled' | 'runtime' | 'inline' | 'external'
      exclude: 'node_modules/**'
    })
  ]
}
