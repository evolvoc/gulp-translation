var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Vinyl = require('vinyl');

const PLUGIN_NAME = 'gulp-translation';



var translate = function(opt)
{
	if(!opt.localeFiles)
	{
		
	}

	var locales = {};

	opt.localeFiles.pipe(gutil.buffer(function(err, files)
	{
		files.forEach(function(file)
		{
			locales[file.relative.split('.')[0]] = JSON.parse(file.contents.toString('utf8'));
		});

		gutil.log(locales);
	}));


	var transform = function(file, enc, callback)
	{
		if(file.isNull())
		{
			return callback();
		}

		if(file.isStream())
		{
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return callback();
		}


		this.push(file);


	};


	return through.obj(transform);
};


module.exports = translate;