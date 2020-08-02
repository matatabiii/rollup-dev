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

/* ---------------------- # BrowserSync ---------------------- */
const browserSyncCreate = browserSync.create()

const browserSyncServer = done => {
  browserSyncCreate.init({
    server: {
      baseDir: './dist/'
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
  src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
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
    .pipe(rename({ basename: 'style' }))
    .pipe(sourcemaps.write())
    .pipe(dest('./dist/assets/css/'))

  browserSyncCreate.reload()
}

const sassProduction = async () => {
  src('./src/sass/**/*.scss')
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
    .pipe(rename({ basename: 'style' }))
    .pipe(postcss([cssnano({ autoprefixer: false })]))
    .pipe(dest('./dist/assets/css/'))
}

/* ---------------------- # SVG Sprite ---------------------- */
const svgSprite = () => {
  return src('./src/svg/**/*.svg')
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
        src('./src/svg/_template.html')
          .pipe(template({
            inlineSvg: $('svg'),
            symbols: symbols
          }))
          .pipe(rename('index.html'))
          .pipe(dest('./dist/assets/svg/'))
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('./dist/assets/svg/'))
}

/* ---------------------- # Watch ---------------------- */
const watching = () => {
  watch('./src/js/**/*.js', series(jsDevelopment))
  watch('./src/svg/**/*.svg', series(svgSprite))
  watch('./src/sass/**/*.scss', series(sassDevelopment))
  watch('./dist/**/*.(html|php)', series(browserSyncReload))
}

/* ---------------------- # exports ---------------------- */
// 納品用
exports.default = series(
  jsProduction,
  sassProduction,
  svgSprite
)

// 開発用
exports.start = series(
  jsDevelopment,
  sassDevelopment,
  svgSprite,
  browserSyncServer,
  watching
)

// 開発終了後
exports.clean = cb => {
  del(src('./dist'))
  cb()
}
