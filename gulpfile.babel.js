import fs from 'fs'
import { src, dest, series, parallel, watch, task } from 'gulp'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import del from 'del'

import { rollup } from 'rollup'
import rollupConfig from './rollup.config.js'
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

import nunjucks from 'gulp-nunjucks-render'
import data from 'gulp-data'
import beautify from 'gulp-html-beautify'

const NS = {
  ASSETS: 'wordpress/wp-content/themes/minamiaso/assets', // assets
  CSS: 'css',
  SASS: 'sass',
  JS: 'js',
  IMAGES: 'images',
  FONTS: 'fonts',
  ICON: 'icon',
  SVG: 'svg',
  SPRITES: 'sprites',
  TEMPLATE: 'template',
  DIST: './dist',
  SRC: './src',
  ICONFILE: 'sprite.svg',
  CSSFILENAME: 'main'
}

/* ビルド前 */
const SRC = {}
SRC.ROOT = `${NS.SRC}/`
SRC.SASS = `${SRC.ROOT}${NS.SASS}/`
SRC.JS = `${SRC.ROOT}${NS.JS}/`
SRC.ICON = `${SRC.ROOT}${NS.ICON}/`
SRC.TEMPLATE = `${SRC.ROOT}${NS.TEMPLATE}/`
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
  - テンプレートエンジン【 ${SRC.TEMPLATE} 】

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
const jsDevelopment = async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins
  })

  await bundle.write(rollupConfig.output[0])

  browserSyncCreate.reload()
}

const jsProduction = async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins
  })

  await bundle.write(rollupConfig.output[1])
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
        ]
      })
    ]))
    .pipe(rename({ basename: `${NS.CSSFILENAME}` }))
    // .pipe(sourcemaps.write())
    .pipe(dest(`${DIST.CSS}`))

  browserSyncCreate.reload()
}

const sassProduction = async () => {
  src(`${SRC.SASS}**/*.scss`)
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
        ]
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

/* ---------------------- # Nunjucks ---------------------- */
const nunjucksTask = async () => {
  src(`${SRC.TEMPLATE}**/*.njk`)
    .pipe(
      plumber({
        errorHandler: notify.onError('\n' + 'Nunjucks に Error が存在します' + '\n' + '<%= error.message %>' + '\n')
      })
    )
    .pipe(data(function () {
      return require(`${SRC.TEMPLATE}_data/config.json`)
    }))
    .pipe(nunjucks({
      path: `${SRC.TEMPLATE}`
    }))
    .pipe(beautify({
      indent_size: 2
    }))
    .pipe(dest(`${DIST.ROOT}`))

  browserSyncCreate.reload()
}

/* ---------------------- # Watch ---------------------- */
const watching = () => {
  watch(`${SRC.JS}**/*.(js|ts)`, series(jsDevelopment))
  watch(`${SRC.ICON}**/*.svg`, series(svgSprite))
  watch(`${SRC.SASS}**/*.scss`, series(sassDevelopment))
  watch(`${SRC.TEMPLATE}**/*.njk`, series(nunjucksTask))
  watch(`${DIST.ROOT}**/*.(php)`, series(browserSyncReload))
}

/* ---------------------- # exports ---------------------- */
// 納品用
exports.default = series(
  jsProduction,
  sassProduction,
  svgSprite,
  nunjucksTask
)

// 開発用
exports.start = series(
  nunjucksTask,
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
