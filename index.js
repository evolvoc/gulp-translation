var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = require('vinyl');
var async = require('async');
var glob = require('glob');

const PLUGIN_NAME = 'gulp-translation';


var translate = function(opt)
{
	if(!opt.locale)
	{
		throw new Error('you should passe locale option');
	}

	var prefix = opt.prefix || '\\{';
	var suffix = opt.suffix || '}';

	// regex are generated
	var basicRegex = new RegExp(prefix + '\\s?(\\w+)\\s?' + suffix, 'gm');
	var parameterRegex = new RegExp(prefix + '\\s?(\\w+)\\s?\\|\\s([\\w,\\:\\s]+)\\s?' + suffix, 'gm');

	// locales files are parsed
	var locales = {};

	glob.sync(opt.locale).forEach(function(localeFilePath)
	{
		locales[path.basename(localeFilePath).split('.')[0]] = JSON.parse(fs.readFileSync(localeFilePath).toString('utf8'));
	});


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

		
		for(var locale in locales)
		{
			var text = file.contents.toString('utf8');

			// basic translation
			text = text.replace(basicRegex, function(match, word)
			{
				return locales[locale][word];
			});

			// translation with parameters
			text = text.replace(parameterRegex, function(match, word, parameters)
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


			// a translated file is created
			var translatedFile = new File(
			{
				cwd: file.cwd,
				base: file.base,
				path: path.join(file.base, locale, file.relative),
				contents: new Buffer(text)
			});

			this.push(translatedFile);
		}

		callback();
	};

	
	return through.obj(transform);
};


module.exports = translate;