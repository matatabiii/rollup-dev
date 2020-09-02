import fs from 'fs'
import { src, dest, series, parallel, watch, task } from 'gulp'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'
// import sourcemaps from 'gulp-sourcemaps'
import del from 'del'
import pkg from './package.json'
import camelCase from 'lodash.camelcase'
import upperFirst from 'lodash.upperfirst'

import { rollup } from 'rollup'
import rollupConfig from './rollup.config.js'
import rollupTypescript from '@rollup/plugin-typescript' // TypeScript
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve' // node_modules
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs' // CommonJSモジュールをES6に変換
import babel from '@rollup/plugin-babel' // Babel
import { terser } from 'rollup-plugin-terser' // JS minfy

import browserSync from 'browser-sync'

import Fiber from 'fibers'
import dartSass from 'sass'
import sassGlob from 'gulp-sass-glob'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import cssnext from 'postcss-cssnext'
import mqpacker from 'css-mqpacker'
import cssnano from 'cssnano'
import postcssGapProperties from 'postcss-gap-properties'

import svgmin from 'gulp-svgmin'
import svgstore from 'gulp-svgstore'
import cheerio from 'gulp-cheerio'
import template from 'gulp-template'

import ejs from 'gulp-ejs'
import beautify from 'gulp-html-beautify'

const NS = {
  ASSETS: 'assets', // assets
  CSS: 'css',
  SASS: 'sass',
  JS: 'js',
  IMAGES: 'images',
  FONTS: 'fonts',
  ICON: 'icon',
  SVG: 'svg',
  SPRITES: 'sprites',
  TEMPLATE: 'template',
  EJS: 'ejs',
  DIST: './dist',
  SRC: './src',
  ICONFILE: 'sprite.svg',
  CSSFILENAME: 'main',
  JSFILENAME: 'main'
}

/* ビルド前 */
const SRC = {}
SRC.ROOT = `${NS.SRC}/`
SRC.SASS = `${SRC.ROOT}${NS.SASS}/`
SRC.JS = `${SRC.ROOT}${NS.JS}/`
SRC.ICON = `${SRC.ROOT}${NS.ICON}/`
SRC.TEMPLATE = `${SRC.ROOT}${NS.TEMPLATE}/`
SRC.EJS = `${SRC.ROOT}${NS.EJS}/`
SRC.SPRITES = `${SRC.ROOT}${NS.SPRITES}/`

/* ビルド後 */
const DIST = {}
DIST.ROOT = `${NS.DIST}/`
DIST.ASSETS = `${DIST.ROOT}${NS.ASSETS}/`
DIST.JS = `${DIST.ASSETS}${NS.JS}/`
DIST.CSS = `${DIST.ASSETS}${NS.CSS}/`
DIST.IMAGES = `${DIST.ASSETS}${NS.IMAGES}/`
DIST.FONTS = `${DIST.ASSETS}${NS.FONTS}/`
DIST.SVG = `${DIST.ASSETS}${NS.SVG}/`

/* ---------------------- # ファイル構造 ログ ---------------------- */
const dirLog = () => {
  console.log(`
  ---------- 【 ファイル構造 】 -----------
  # ビルド前パス
  - ルート【 ${SRC.ROOT} 】
  - sass【 ${SRC.SASS} 】
  - js【 ${SRC.JS} 】
  - SVGスプライト【 ${SRC.ICON} 】
  - EJS【 ${SRC.EJS} 】

  # ビルド後
  - ルート【 ${DIST.ROOT} 】
  - アセット【 ${DIST.ASSETS} 】
  - js【 ${DIST.JS} 】
  - css【 ${DIST.CSS} 】
  - images【 ${DIST.IMAGES} 】
  - fonts【 ${DIST.FONTS} 】
  - SVGスプライト出力【 ${DIST.SVG} 】
  -------------------------------
  `)
}

/* ---------------------- # BrowserSync ---------------------- */
const browserSyncCreate = browserSync.create()

const browserSyncServer = done => {
  browserSyncCreate.init({
    server: {
      baseDir: `${DIST.ROOT}`
    },
    port: 3000
  })
  done()
}

const browserSyncReload = async () => {
  browserSyncCreate.reload()
}

/* ---------------------- # JavaScript ---------------------- */
// const moduleName = upperFirst(camelCase(pkg.name.replace(/^@.*\//, '')))
// ライブラリに埋め込むcopyright
// const banner = `/*!
//   ${moduleName}.js v${pkg.version}
//   ${pkg.homepage}
//   Released under the ${pkg.license} License.
// */`

const moduleName = upperFirst(camelCase(pkg.name.replace(/^@.*\//, '')))
const rollupDistfileName = NS.JSFILENAME + '.js'

// ライブラリに埋め込むcopyright
// const banner = `/*!
//   ${moduleName}.js v${pkg.version}
//   ${pkg.homepage}
//   Released under the ${pkg.license} License.
// */`

// pluginsは変数に打ち込むとウォッチでコンパイルされなくなる...
const jsDevelopment = async (cb) => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: [...Object.keys(pkg.devDependencies || {})], // 開発用モジュールは含めない
    plugins: [
      json(),
      nodeResolve({
        browser: true
      }),
      rollupTypescript(),
      commonjs({ extensions: ['.ts', '.js'] }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      babel({
        babelHelpers: 'runtime', // 'bundled' | 'runtime' | 'inline' | 'external'
        exclude: 'node_modules/**'
      })
    ]
  })

  await bundle.write({
    file: DIST.JS + rollupDistfileName,
    format: 'iife',
    name: 'APPS' // moduleName
    // banner
  })

  browserSyncCreate.reload()
}

const jsProduction = async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: [...Object.keys(pkg.devDependencies || {})], // 開発用モジュールは含めない
    plugins: [
      json(),
      nodeResolve({
        browser: true
      }),
      rollupTypescript(),
      commonjs({ extensions: ['.ts', '.js'] }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      babel({
        babelHelpers: 'runtime', // 'bundled' | 'runtime' | 'inline' | 'external'
        exclude: 'node_modules/**'
      })
    ]
  })

  await bundle.write({
    file: DIST.JS + rollupDistfileName,
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
  })
}

/* ---------------------- # Sass ---------------------- */
sass.compiler = dartSass
const sassDevelopment = async () => {
  src(`${SRC.SASS}**/*.scss`)
    // .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(plumber({ errorHandler: notify.onError(sass.logError) }))
    .pipe(
      sass({
        fiber: Fiber,
        outputStyle: 'expanded'
      })
    )
    .pipe(postcss([
      mqpacker(),
      postcssGapProperties(),
      cssnext({
        browsers: [
          'last 2 versions',
          'ie >= 11'
        ],
        features: {
          customProperties: false
        }
      })
    ]))
    .pipe(rename({ basename: `${NS.CSSFILENAME}` }))
    // .pipe(sourcemaps.write())
    .pipe(dest(`${DIST.CSS}`))

  browserSyncCreate.reload()
}

const sassProduction = async () => {
  src(`${SRC.SASS}**/*.scss`)
    .pipe(sassGlob())
    .pipe(
      sass({
        fiber: Fiber,
        outputStyle: 'expanded'
      })
    )
    .pipe(plumber({ errorHandler: notify.onError(sass.logError) }))
    .pipe(postcss([
      mqpacker(),
      postcssGapProperties(),
      cssnext({
        browsers: [
          'last 2 versions',
          'ie >= 11'
        ],
        features: {
          customProperties: false
        }
      })
    ]))
    .pipe(rename({ basename: `${NS.CSSFILENAME}` }))
    .pipe(postcss([cssnano({ autoprefixer: false })]))
    .pipe(dest(`${DIST.CSS}`))
}

/* ---------------------- # SVG Sprite ---------------------- */
const svgSprite = () => {
  return src(`${SRC.ICON}**/*.svg`)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(rename({ prefix: 'i-' }))
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: ($, file) => {
        $('style,title,defs').remove() // 不要なタグを削除
        $('[id]:not(symbol)').removeAttr('id') // symbolタグ以外のid属性を削除
        $('[class^="st"],[class^="cls"]').removeAttr('class') // // Illustratorで付与される「st」または「cls」ではじまるclass属性を削除
        $('[style]:not(svg)').removeAttr('style') // svgタグ以外のstyle属性を削除
        $('[data-name]').removeAttr('data-name') // data-name属性を削除
        $('[fill]').removeAttr('fill') // fill属性を削除
        $('svg').attr('style', 'position: absolute; width: 0; height: 0; overflow: hidden;')

        let $svg = $('svg').html().replace(/<(<g|\/g)>/g, '') // <g>を削除

        $svg = $('<defs></defs>').html($($svg)) // defsで囲む処理

        // _base.htmlに渡すid
        const symbols = $('svg > symbol').map(function () {
          return { id: $(this).attr('id') }
        }).get()

        // 一度中身を空にして追加
        $('svg').empty()
        $('svg').append($svg)

        // _base.htmlを基に、index.htmlをルートに生成
        src(`${SRC.ICON}_template.html`)
          .pipe(template({
            inlineSvg: $('svg'),
            symbols: symbols
          }))
          .pipe(rename('index.html'))
          .pipe(dest(`${DIST.SVG}`))
          .pipe(dest(`${SRC.ICON}`))
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(rename(`${NS.ICONFILE}`))
    .pipe(dest(`${DIST.SVG}`))
}

/* ---------------------- # Ejs ---------------------- */
const ejsTask = async () => {
  src([`${SRC.EJS}**/*.ejs`, `!${SRC.EJS}**/_*.ejs`])
    .pipe(
      plumber({
        errorHandler: notify.onError('\n' + 'ejs に Error が存在します' + '\n' + '<%= error.message %>' + '\n')
      })
    )
    .pipe(ejs({ fs }, {}))
    .pipe(beautify({
      indent_size: 2
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(`${DIST.ROOT}`))

  browserSyncCreate.reload()
}

/* ---------------------- # Watch ---------------------- */
const watching = () => {
  watch(`${SRC.JS}**/*.(js|ts)`, series(jsDevelopment))
  watch(`${SRC.ICON}**/*.svg`, series(svgSprite))
  watch(`${SRC.SASS}**/*.scss`, series(sassDevelopment))
  watch(`${SRC.EJS}**/*.ejs`, series(ejsTask))
  watch(`${DIST.ROOT}**/*.(php)`, series(browserSyncReload))
}

/* ---------------------- # exports ---------------------- */
// 納品用
exports.default = series(
  jsProduction,
  sassProduction,
  svgSprite,
  ejsTask
)

// 開発用
exports.start = series(
  ejsTask,
  jsDevelopment,
  sassDevelopment,
  svgSprite,
  browserSyncServer,
  watching,
  dirLog
)

// 開発終了後
exports.clean = cb => {
  del(src(`${DIST.ROOT}`))
  cb()
}
