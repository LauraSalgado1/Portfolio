const gulp = require("gulp"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  minifyCSS = require("gulp-clean-css"),
  concat = require("gulp-concat"),
  autoprefixer = require("gulp-autoprefixer"),
  babel = require("gulp-babel"),
  del = require("del"),
  browserSync = require("browser-sync").create(),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  notify = require("gulp-notify"),
  plumber = require("gulp-plumber"),
  uglify = require("gulp-uglify"),
  //define file paths for working files and compiled files
  paths = {
    styles: {
      src: "sass/**/*.scss",
      dest: "./",
    },
    scripts: {
      src: "js/working-js/**/*.js",
      dest: "js/compiled-js",
    },
  };

//delete previously compiled files
function clean() {
  return del([paths.scripts.dest, "style.css", "style.css.map"]);
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(minifyCSS())
    .pipe(concat("style.css"))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(["./js/working-js/scripts.js"])
    .pipe(
      babel({
        presets: [
          [
            "env",
            {
              targets: {
                browsers: ["last 1 versions", "ie >= 11"],
              },
            },
          ],
        ],
      })
    )
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )

    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.scripts.dest));
}

// configure which files to watch and what tasks to use on file changes
function watch() {
  browserSync.init({
    server: "./",
  });
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts).on("change", browserSync.reload);
}

const build = gulp.series(clean, styles, scripts, watch);

exports.build = gulp.series(clean, styles, scripts);
exports.default = build;
