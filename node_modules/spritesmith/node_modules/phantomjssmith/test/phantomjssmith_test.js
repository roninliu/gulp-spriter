// Load in dependencies
var expect = require('chai').expect;
var spritesmithEngineTest = require('spritesmith-engine-test');
var phantomjssmith = require('../lib/phantomjssmith');

// Start the normal test
spritesmithEngineTest.run({
  engine: phantomjssmith,
  engineName: 'phantomjssmith'
});

// Define phantomjssmith specific tests
var testUtils = spritesmithEngineTest.spritesmithUtils;
describe('phantomjssmith', function () {
  describe('exporting a jpeg', function () {
    // Set up canvas for test case
    var multipleImages = spritesmithEngineTest.config.multipleImages;
    testUtils.interpretImages(phantomjssmith, multipleImages.filepaths);
    testUtils._createCanvas(phantomjssmith, multipleImages.width, multipleImages.height);
    testUtils._addImages(multipleImages.coordinateArr);

    // Run export for a jpeg
    before(function exportJpeg (done) {
      // Export canvas as a jpeg
      // https://github.com/twolfson/gulp.spritesmith/issues/19#issuecomment-57157408
      var that = this;
      this.canvas['export']({format: 'jpeg'}, function (err, result) {
        that.result = result;
        done(err);
      });
    });
    after(function cleanupExport () {
      delete this.result;
    });

    // Allow for debugging
    if (process.env.TEST_DEBUG) {
      testUtils.debugResult();
    }

    // Load in pixels for assertions
    testUtils.loadActualPixels('image/jpeg');
    testUtils.loadExpectedPixels(multipleImages.expectedImage, 'image/png');

    // Assert against our pixels
    it('returns an image', function () {
      // Localize pixel info
      var actualPixels = this.actualPixels;
      var expectedPixels = this.expectedPixels;

      // Compare pixels
      var i = 0;
      var len = actualPixels.length;
      for (; i < len; i++) {
        // If the pixels did not match, complain and throw
        var pixelsWithinThreshold = Math.abs(expectedPixels[i] - actualPixels[i]) <= 10;
        expect(pixelsWithinThreshold).to.equal(true,
          'Expected ' + expectedPixels[i] + ' and ' + actualPixels[i] + ' to be at most 10 apart. Index was ' + i);
      }
    });
  });

  describe('running against very long URLs', function () {
    // Set up canvas for test case
    var multipleImages = spritesmithEngineTest.config.multipleImages;
    testUtils.interpretImages(phantomjssmith, multipleImages.filepaths);
    testUtils._createCanvas(phantomjssmith, multipleImages.width, multipleImages.height);
    testUtils._addImages(multipleImages.coordinateArr);

    // Run export with excessive meta data
    before(function exportWithLongMetadata (done) {
      // Generate a long string (looooooong)
      // https://github.com/twolfson/phantomjssmith/issues/3
      // DEV: Unfortunately, this test doesn't reproduce the issue on Linux
      var longStr = 'l',
          i = 71663;
      while (i--) {
        longStr += 'o';
      }
      longStr += 'ng';

      // Export canvas with way too much meta data
      var that = this;
      this.canvas['export']({format: 'png', longStr: longStr}, function (err, result) {
        that.result = result;
        done(err);
      });
    });
    after(function cleanupExport () {
      delete this.result;
    });

    it('does not crash', function () {
      // Would have thrown
    });
    it('returns an image', function () {
      expect(this.result).to.not.equal('');
    });
  });

  describe('with a custom timeout', function () {
    // Set up canvas for test case
    var multipleImages = spritesmithEngineTest.config.multipleImages;
    testUtils.interpretImages(phantomjssmith, multipleImages.filepaths);
    testUtils._createCanvas(phantomjssmith, multipleImages.width, multipleImages.height);
    testUtils._addImages(multipleImages.coordinateArr);

    // Run export with short timeout
    before(function exportWithShortTimeout (done) {
      var that = this;
      this.canvas['export']({format: 'png', timeout: 1}, function (err, result) {
        that.err = err;
        that.result = result;
        done();
      });
    });
    after(function cleanupResults () {
      delete this.err;
      delete this.result;
    });

    it('times out very easily', function () {
      expect(this.err.message).to.contain('Timing out script.');
    });
  });
});
