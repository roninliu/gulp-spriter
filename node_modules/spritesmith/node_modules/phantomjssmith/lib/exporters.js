// TODO: Can we do some inversion of control here?
// TODO: Should we be explicit in export options? -- I think so -- it is good observer formatting
var path = require('path'),
    spawn = require('child_process').spawn,
    Tempfile = require('temporary/lib/file'),
    which = require('which'),
    phantomLocation = which.sync('phantomjs'),
    jpegJs = require('jpeg-js'),
    ndarray = require('ndarray'),
    savePixels = require('save-pixels'),
    exporters = {};

// Function to add new exporters
function addExporter(name, exporter) {
  exporters[name] = exporter;
}

// Helper to create exporters (could be a class for better abstraction)
function getPhantomjsExporter(ext) {
  /**
   * Generic exporter
   * @param {Object} options Options to export with
   * @param {Number} [options.quality] Quality of the exported item
   * @param {Function} cb Error-first callback to return binary image string to
   */
  return function phantomjsExporterFn (options, cb) {
    var that = this;

    // Convert over all image paths to url paths
    var images = that.images;
    images.forEach(function getUrlPath (img) {
      img = img.img;
      img._urlpath = path.relative(__dirname + '/scripts', img._filepath);
    });

    // Collect our parameters
    var params = that.params;
    params.images = images;
    params.options = options;

    // Stringify our argument for phantomjs
    var arg = JSON.stringify(params),
        encodedArg = encodeURIComponent(arg);

    // Write out argument to temporary file -- streams weren't cutting it
    var tmp = new Tempfile(),
        filepath = tmp.path;
    tmp.writeFileSync(encodedArg, 'utf8');

    // Create a child process for phantomjs
    var phantomjs = spawn(phantomLocation, [__dirname + '/scripts/compose.js', filepath]);

    // When there is data, save it
    // DEV: encodedPixels is an array of rgba values
    var encodedPixels = '';
    phantomjs.stdout.on('data', function (buffer) {
      encodedPixels += buffer.toString();
    });

    // When there is an error, concatenate it
    var err = '';
    phantomjs.stderr.on('data', function (buffer) {
      // Ignore PhantomJS 1.9.2 OSX errors
      // https://github.com/Ensighten/grunt-spritesmith/issues/33
      var bufferStr = buffer + '',
          isNot192OSXError = bufferStr.indexOf('WARNING: Method userSpaceScaleFactor') === -1,
          isNotPerformanceNote = bufferStr.indexOf('CoreText performance note:') === -1;
      if (isNot192OSXError && isNotPerformanceNote) {
        err += bufferStr;
      }
    });

    // When we are done
    phantomjs.on('close', function () {
      // Destroy the temporary file
      try { tmp.unlinkSync(); } catch (e) {}

      // If there was an error in phantom, callback with it
      if (err) {
        return cb(new Error(err));
      }

      // Otherwise, decode the pixel values
      // DEV: This used to be thinner and not need padding but Windows was messing up the image
      var decodedPixels;
      try {
        decodedPixels = JSON.parse(encodedPixels);
      } catch (e) {
        return cb(new Error('Error while parsing JSON "' + encodedPixels + '".\n' + e.message));
      }

      // If we are dealing with a `jpeg`, then use `jpeg-js`
      if (ext === 'jpeg') {
        var jpg;
        try {
          jpg = jpegJs.encode({
            data: decodedPixels,
            width: params.width,
            height: params.height
          }, options.quality);
        } catch (err) {
          return cb(err);
        }
        cb(null, jpg.data);
      // Otherwise, leverage `save-pixels`
      } else {
        // Convert the pixels into an ndarray
        // Taken from https://github.com/mikolalysenko/get-pixels/blob/2ac98645119244d6e52afcef5fe52cc9300fb27b/dom-pixels.js#L14
        var pngNdarray = ndarray(decodedPixels, [params.height, params.width, 4],
                           [4 * params.width, 4, 1], 0),
            png = savePixels(pngNdarray, 'PNG');

        // Pump the stream from png to a binary string (expected by spritesmith)
        // TODO: We should be calling back with the stream =(
        var retVal = '';
        png.on('data', function (buffer) {
          retVal += buffer.toString('binary');
        });
        png.on('end', function () {
          cb(null, retVal);
        });
      }
    });
  };
}

// Generate the png exporter
var phantomjsPngExporter = getPhantomjsExporter('png');
addExporter('png', phantomjsPngExporter);
addExporter('image/png', phantomjsPngExporter);

// Generate the jpeg exporter
var phantomjsJpegExporter = getPhantomjsExporter('jpeg');
addExporter('jpeg', phantomjsJpegExporter);
addExporter('image/jpeg', phantomjsJpegExporter);
addExporter('jpg', phantomjsJpegExporter);
addExporter('image/jpg', phantomjsJpegExporter);

// Export our exporters
module.exports = {
  exporters: exporters,
  addExporter: addExporter
};
