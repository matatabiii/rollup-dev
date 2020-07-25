import gulp from 'gulp'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import rename from 'gulp-rename'

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
gulp.task('buildJs', async () => {
  const bundle = await rollup({
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins
  })

  await bundle.write(rollupConfig.output[0]) // 通常
  await bundle.write(rollupConfig.output[1]) // minify

  browserSyncCreate.reload()
})

/* ---------------------- # Sass ---------------------- */
sass.compiler = dartSass
gulp.task('buildSass', async () => {
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
          'ie >= 11',
          'not ie <= 10',
          'ios >= 8',
          'android >= 5'
        ]
      })
    ]))
    .pipe(rename({ basename: 'style-build' }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(rename({ basename: 'style' }))
    .pipe(postcss([cssnano({ autoprefixer: false })]))
    .pipe(gulp.dest('./dist/css/'))

  browserSyncCreate.reload()
})

/* ---------------------- # Watch ---------------------- */
gulp.task('watch', () => {
  gulp.watch('./src/**/*.js', gulp.series('buildJs'))
  gulp.watch('./src/**/*.scss', gulp.series('buildSass'))
  gulp.watch('./dist/**/*.(html|php)', gulp.series('reload'))
})

/* ---------------------- # Default ---------------------- */
gulp.task(
  'default',
  gulp.series(
    'browser-sync',
    'buildJs',
    'buildSass',
    'watch'
  )
)
