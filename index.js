var path = require('path');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = require('vinyl');
var async = require('async');

const PLUGIN_NAME = 'gulp-translation';


var translate = function(opt)
{
	if(!opt.localeFiles)
	{
		
	}

	


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

		var self = this;

		getLocales(opt.localeFiles, function(err, locales)
		{
			for(var locale in locales)
			{
				var text = file.contents.toString('utf8');

				// basic translation
				text = text.replace(/\{\s?(\w+)\s?\}/mg, function(match, word)
				{
					return locales[locale][word];
				});

				// translation with parameters
				text = text.replace(/\{\s?(\w+)\s?\|\s([\w,\:\s]+)\s?}/mg, function(match, word, parameters)
				{
					parameters = parameters.split(',');

					var translatedString = locales[locale][word];

					// replace each parameters by its translation
					for(var i in parameters)
					{
						// for named parameter
						if(parameters[i].match(/\w+\s?:\s?\w+/))
						{
							var parameter = parameters[i].split(':');

							// 
							translatedString = translatedString.replace
							(
								new RegExp('\\{\\s?' + parameter[0].trim() + '\\s?}', 'gm'),
								parameter[1].trim()
							);
						}
						else // for ordered parameters
						{
							gutil.log('ordered parameters is not implemented yet!')
						}
					}

					return translatedString;
				});


				var translatedFile = new File(
				{
					cwd: file.cwd,
					base: file.base,
					path: path.join(file.base, locale, file.relative),
					contents: new Buffer(text)
				});

				self.push(translatedFile);
			}

			callback();
		});
	};


	return through.obj(transform);
};


var getLocales = async.memoize(function(localeFiles, callback)
{
	localeFiles.pipe(gutil.buffer(function(err, localeFiles)
	{
		var locales = {};
		localeFiles.forEach(function(localeFile)
		{
			locales[localeFile.relative.split('.')[0]] = JSON.parse(localeFile.contents.toString('utf8'));
		});

		callback(null, locales);
	}));
}, function(){return 1});


module.exports = translate;