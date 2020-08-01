import gulp from 'gulp'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'

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
gulp.task('browser-sync', (done) => {
  browserSyncCreate.init({
    server: {
      baseDir: './dist/'
    },
    port: 3000
  })
  done()
})

gulp.task('reload', async () => {
  browserSyncCreate.reload()
})

/* ---------------------- # JavaScript ---------------------- */
gulp.task('js:development', async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins
  })

  await bundle.write(rollupConfig.output[0])

  browserSyncCreate.reload()
})

gulp.task('js:production', async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins
  })

  await bundle.write(rollupConfig.output[1])
})

/* ---------------------- # Sass ---------------------- */
sass.compiler = dartSass
gulp.task('sass:development', async () => {
  gulp
    .src('./src/sass/**/*.scss')
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
    .pipe(gulp.dest('./dist/assets/css/'))

  browserSyncCreate.reload()
})

gulp.task('sass:production', async () => {
  gulp
    .src('./src/sass/**/*.scss')
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
    .pipe(gulp.dest('./dist/assets/css/'))
})

/* ---------------------- # SVG Sprite ---------------------- */
gulp.task('svg:sprite', done => {
  gulp.src('./src/svg/**/.svg')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(rename({ prefix: 'i-' }))
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: function ($, file) {
        // 不要なタグを削除
        $('style,title,defs').remove()
        // symbolタグ以外のid属性を削除
        $('[id]:not(symbol)').removeAttr('id')
        // Illustratorで付与される「st」または「cls」ではじまるclass属性を削除
        $('[class^="st"],[class^="cls"]').removeAttr('class')
        // svgタグ以外のstyle属性を削除
        $('[style]:not(svg)').removeAttr('style')
        // data-name属性を削除
        $('[data-name]').removeAttr('data-name')
        // fill属性を削除
        $('[fill]').removeAttr('fill')
        // svgタグにdisplay:noneを付与（読み込み時、スプライト全体を非表示にするため）
        $('svg').attr('style', 'position: absolute; width: 0; height: 0; overflow: hidden;')

        let $svg = $('svg').html().replace(/(<g>|<\/g>)/g, '') // <g>を削除

        const $saveSymbol = $($svg)

        $svg = $('<defs></defs>').html($saveSymbol) // defsで囲む処理

        // _template.htmlに渡すid
        var symbols = $('svg > symbol').map(() => {
          return {
            id: $(this).attr('id')
          }
        }).get()

        // _template.htmlを基に、_sample.htmlをルートに生成
        gulp.src('./src/images/svg/_template.html')
          .pipe(template({
            inlineSvg: $('svg'),
            symbols: symbols
          }))
          .pipe(rename('sprite-sheet.html'))
          .pipe(gulp.dest('./src/svg/'))
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('./dist/assets/svg/'))

  done()
})

/* ---------------------- # Watch ---------------------- */
gulp.task('watch', () => {
  gulp.watch('./src/js/**/*.js', gulp.series('js:development'))
  gulp.watch('./src/svg/**/*.svg', gulp.series('svg:sprite'))
  gulp.watch('./src/sass/**/*.scss', gulp.series('sass:development'))
  gulp.watch('./dist/assets/**/*.(html|php)', gulp.series('reload'))
})

/* ---------------------- # Default ---------------------- */
gulp.task(
  'default',
  gulp.series(
    'js:production',
    'sass:production',
    'svg:sprite'
  )
)

gulp.task(
  'start',
  gulp.series(
    'js:development',
    'sass:development',
    'svg:sprite',
    'browser-sync',
    'watch'
  )
)
