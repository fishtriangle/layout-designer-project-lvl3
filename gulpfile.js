const { src, dest, parallel, series, watch } = require('gulp');
 
// Подключаем Browsersync
const browserSync = require('browser-sync').create();
 
// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;
 
// Подключаем модуль gulp-sass
const sass = require('gulp-sass');
 
// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');
 
// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем gulp-imagemin для работы с изображениями
//const imagemin = require('gulp-imagemin');

// Подключаем модуль gulp-newer
const newer = require('gulp-newer');

// Подключаем модуль del
const del = require('del');

// Подключаем модуль pug
const pug = require('gulp-pug');

// Подключаем модуль sprite 
const svgSprite = require('gulp-svg-sprite');
//const gulpSpriteSmith = require('gulp.spritesmith');
//const gulpStylus = require('gulp-stylus');

const gulpStylelint = require('gulp-stylelint');

//const babel = require('gulp-babel');

let config = {
	shape: {
		dimension: {
			attributes: false
		}
	},
  mode: {
    stack: true
  }	
};

// Вывод в браузер
const browsersync = () => {
	browserSync.init({
		server: { baseDir: 'build/' },
		watch: true,
		notify: false,
		online: false
	})
}

// Преобразование паг-html
const buildHTML = () => {
	return src('app/pug/*.pug')
  .pipe(pug())
  .pipe(dest('build/'))
}

const deleteHTML = () => {
  return del('build/**/*.html', { force: true })
}

const scripts = () => {
	return src([ // Берём файлы из источников
		'node_modules/jquery/dist/jquery.slim.min.js',
		'node_modules/popper.js/dist/popper.min.js',
		'node_modules/bootstrap/dist/js/bootstrap.min.js',
		//'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('build/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}


// Преобразование svg - sprite
const makesprite = () => {
	return src('app/images/source/icons/*.svg')
  .pipe(svgSprite(config))
  .pipe(dest('build/images/dest/sprite'))
}



// Преобразование стилей
const scss = () => {
	return src('app/scss/styles.scss') // Выбираем источник
	.pipe(sass()) // Преобразуем значение переменной "preprocessor" в функцию
	.pipe(concat('styles.css')) // Конкатенируем в файл
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('build/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}


// Преобразование изображений
const images = () => {
	return src('app/images/source/**/*.jpg') // Берём все изображения из папки источника
	.pipe(newer('build/images/dest')) // Проверяем, было ли изменено (сжато) изображение ранее
//	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('build/images/dest')) // Выгружаем оптимизированные изображения в папку назначения
}

const cleanimg = () => {
	return del('build/images/dest/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}


// сборка проекта
//const buildcopy = () => {
//	return src([ // Выбираем нужные файлы
//		'app/css/styles.css',
//		'app/js/app.min.js',
//		'app/images/dest/**/*',
//		'app/*.html',
//		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
//	.pipe(dest('build')) // Выгружаем в папку с финальной сборкой
//}

const cleanbuild = () => {
	return del('build/**/*', { force: true }) // Удаляем всё содержимое папки "build/"
}

// Мониторинг изменений
const startwatch = () => {
	// Мониторим файлы препроцессора на изменения
	watch('app/scss/**/*', scss);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/images/source/**/*.jpg', images);

    watch('app/images/source/**/*.svg', makesprite);

    watch('app/pug/**/*.pug', buildHTML);
	watch('app/pug/*.pug', buildHTML);

	watch('app/js/*.js', scripts);
}

const lintScssTask = () => {
  return src('src/**/*.scss')
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.scss = scss;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

exports.buildHTML = series(deleteHTML, buildHTML);

exports.makesprite = makesprite;

exports.lintscss = lintScssTask;

exports.startwatch = startwatch;

// Создаём новый таск "build", который последовательно выполняет нужные операции
// exports.build = series(cleanbuild, scripts, buildHTML, scss, images, makesprite, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = series(cleanbuild, scripts, parallel(buildHTML, scss, images, makesprite, browsersync, startwatch));