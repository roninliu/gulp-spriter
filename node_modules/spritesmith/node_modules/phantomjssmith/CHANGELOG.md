# phantomjssmith changelog
0.5.0 - Added support for JPEG images

0.4.6 - Upgraded to `spritesmith-engine-test@2.0.0` and moved to `mocha`

0.4.5 - Fixed `npm install` inside of Travis CI for `node@0.8` issues

0.4.4 - Corrected typo in assert message via @yairEO in twolfson/gulp.spritesmith#19

0.4.3 - Upgraded to `spritesmith-engine-test@1.2.1` to remove per-repo expected images

0.4.2 - Upgraded `temporary` to fix `node@0.11`. Via @netroy

0.4.1 - Upgraded `npm` inside of Travis CI to fix `node@0.8` issue

0.4.0 - Added `timeout` option to `export`

0.3.0 - Moved to PhantomJS evaluate over URL passing of parameters. Fixes #3

0.2.4 - Added donation section to README

0.2.3 - Added expected file for tests against node@0.8

0.2.2 - Fix for broken tests on Windows

0.2.1 - Removed dev fs.writeFileSync

0.2.0 - Moved off of .toDataURL and onto .getImageData to significantly reduce output size. Fixes #46

0.1.11 - Fixed Mavericks performance message bug #45

0.1.10 - Fixed space directory bug #40

0.1.9 - Fixed OSX bug for PhantomJS 1.9.2 #33

0.1.8 - Fixed Windows bug for full phantomjs path

0.1.7 - Fixed OSX bug for concurrent stats on over 200 images #35

0.1.6 - Added Travis CI

Before 0.1.6 - See `git log`
