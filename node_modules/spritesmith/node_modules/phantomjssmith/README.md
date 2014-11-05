# phantomjssmith [![Build status](https://travis-ci.org/twolfson/phantomjssmith.png?branch=master)](https://travis-ci.org/twolfson/phantomjssmith)

[PhantomJS][phantomjs] engine for [spritesmith][spritesmith].

[phantomjs]: http://phantomjs.org/
[spritesmith]: https://github.com/Ensighten/spritesmith

## Requirements
This depends on having `phantomjs` installed on your machine. For installation instructions, visit [the website][phantomjs]. This module has been tested against `1.9.0`.

## Getting Started
Install the module with: `npm install phantomjssmith`

```javascript
// Convert images into phantomjssmith objects
var images = ['img1.jpg', 'img2.png'];
phantomjssmith.createImages(this.images, function handleImages (err, imgs) {
  // Create a canvas to draw onto (200 pixels wide, 300 pixels tall)
  phantomjssmith.createCanvas(200, 200, function (err, canvas) {
    // Add each image at a specific location (upper left corner = {x, y})
    var coordinatesArr = [{x: 0, y: 0}, {x: 50, y: 50}];
    imgs.forEach(function (img, i) {
      var coordinates = coordinatesArr[i];
      canvas.addImage(img, coordinates.x, coordinates.y);
    }, canvas);

    // Export canvas to image
    canvas['export']({format: 'png'}, function (err, result) {
      result; // Binary string representing a PNG image of the canvas
    });
  });
});
```

## Documentation
This module was built to the specification for all spritesmith modules.

https://github.com/twolfson/spritesmith-engine-test

### canvas['export'](options, cb)
These are options specific `phantomjssmith`

- options `Object`
  - timeout `Number` - Milliseconds to wait until automatically terminating PhantomJS script. By default, this is `10000` (10 seconds).
  - format `String` - Output image format to callback with. Currently, `png` and `jpeg` are available.
  - quality `Number` - If you are outputting a `jpeg`, the quality can be specified from 0 to 100.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint using [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
