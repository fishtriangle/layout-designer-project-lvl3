const { src, dest, parallel, series, watch } = require('gulp');
 
// Подключаем Browsersync
const browserSync = require('browser-sync').create();
 
// Подключаем gulp-concat
const concat = require('gulp-concat');
 
// Подключаем модуль gulp-sass
const sass = require('gulp-sass');
 
// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');
 
// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем gulp-imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');

// Подключаем модуль gulp-newer
const newer = require('gulp-newer');

// Подключаем модуль del
const del = require('del');

const pug = require('gulp-pug');

const svgSprite = require('gulp-svg-sprite');

let preprocessor = 'sass'; // Выбор препроцессора в проекте

let config = {
  mode: {
    css: { // Activate the «css» mode
      render: {
        css: true // Activate CSS output (with default options)
      }
    }
  }
};

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/html/' },
		notify: false,
		online: false
	})
}

function scss() {
	return src('app/scss/app.scss') // Выбираем источник
	.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
	.pipe(concat('styles.css')) // Конкатенируем в файл
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
	return src('app/images/source/**/*.jpg') // Берём все изображения из папки источника
	.pipe(newer('app/images/dest')) // Проверяем, было ли изменено (сжато) изображение ранее
	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('app/images/dest')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/styles.css',
		'app/images/dest/**/*',
		'app/html/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('build')) // Выгружаем в папку с финальной сборкой
}

function cleanbuild() {
	return del('build/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function buildHTML() {
	return src('app/pug/**/*.pug')
  .pipe(pug())
  .pipe(dest('app/html/'))
}

function deleteHTML() {
  return del('app/html/**/*', { force: true })
}

function makesprite() {
	return src('app/images/source/icons/*.svg')
  .pipe(svgSprite(config))
  .pipe(dest('app/images/dest/sprite'))
}

function startwatch() {
	// Мониторим файлы препроцессора на изменения
	watch('app/scss/**/*', scss);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/images/source/**/*.jpg', images);

  watch('app/images/source/**/*.svg', makesprite);

  watch('app/pug/**/*', buildHTML);
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию styles() в таск styles
exports.scss = scss;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

exports.buildHTML = series(deleteHTML, buildHTML);

exports.makesprite = makesprite;

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleanbuild, buildHTML, scss, images, makesprite, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(buildHTML, scss, images, makesprite, browsersync, startwatch);