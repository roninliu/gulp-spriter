/**
 *
 * 雪碧图工具
 *
 */

'use strict';
var gutil = require('gulp-util');
var through = require('through2');

module.exports = function (opts) {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			//dosomething
		}

		if (file.isStream()) {
			//dosomething
		}

		try {
			//dosomething
		} catch (err) {
			//dosomething
		}
		cb();
	});
};