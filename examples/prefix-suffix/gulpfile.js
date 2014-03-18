var gulp = require('gulp');
var translate = require('../../index.js')

gulp.task('translate', function()
{
	return 	gulp.src('*.html')
			.pipe(translate(
			{
				localeFiles: gulp.src('locale/*.json'),
				prefix: '\\[',
				suffix: ']'
			}))
			.pipe(gulp.dest('build'));
});

gulp.task('default', ['translate']);