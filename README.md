[![npm version](https://badge.fury.io/js/karma-nyan-reporter.svg)](http://badge.fury.io/js/karma-nyan-reporter)
[![Build Status](https://travis-ci.org/dgarlitt/karma-nyan-reporter.svg)](https://travis-ci.org/dgarlitt/karma-nyan-reporter)
[![Coverage Status](https://coveralls.io/repos/dgarlitt/karma-nyan-reporter/badge.svg?branch=master)](https://coveralls.io/r/dgarlitt/karma-nyan-reporter?branch=master)
[![Code Climate](https://codeclimate.com/github/dgarlitt/karma-nyan-reporter/badges/gpa.svg)](https://codeclimate.com/github/dgarlitt/karma-nyan-reporter)
<!-- [![Dependency Status](https://david-dm.org/dgarlitt/karma-nyan-reporter.svg)](https://david-dm.org/dgarlitt/karma-nyan-reporter) -->

karma-nyan-reporter
===================

Nyan Cat style reporter originally cobbled together from the [Mocha](http://visionmedia.github.io/mocha/) version

![Karma Nyan Cat Reporter for Karma](https://raw.githubusercontent.com/dgarlitt/image-repo/master/karma-nyan-reporter/v0.2.2/karma-nyan-reporter.gif "Karma Nyan Cat Reporter for Karma")

Installation
========

Installation is simple using npm, just run the following command:

```sh
npm install --save-dev karma-nyan-reporter
```

Since this follows Karma's plugin naming convention, that's all there is to it!

Now, run your tests and enjoy:

```sh
karma start path/to/karma.conf.js --reporters nyan
```

Error and Logging Output
=========

Here is a screenshot of the error and logging output. The errors are displayed hierarchically based on the test suite and nesting level. ```console.log()``` messages are output at the bottom (in blue) below the test summary and grouped by browser.

![Karma Nyan Cat Reporter Error Output](https://raw.githubusercontent.com/dgarlitt/image-repo/master/karma-nyan-reporter/v0.2.2/karma-nyan-reporter-error-output.png "Karma Nyan Cat Reporter Error Output")

Options
=========

If you want to suppress the stack trace at the end of the test run you can use the suppressErrorReport option.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // normal config stuffs

    reporters: ['nyan'],

    // reporter options
    nyanReporter: {
      // suppress the error report at the end of the test run
      suppressErrorReport: true, // default is false

      // suppress the red background on errors 
      // in the error report at the end of the test run
      // any line not containing `node_modules` is highlighted
      suppressErrorHighlighting: true, // default is false

      // increase the number of rainbow lines displayed
      // enforced min = 4, enforced max = terminal height - 1
      numberOfRainbowLines: 100, // default is 4

      // only render the graphic after all tests have finished.
      // This is ideal for using this reporter in a continuous
      // integration environment.
      renderOnRunCompleteOnly: true, // default is false

      // limit the number of lines of error shown
      // No error occurs if this limit is longer than 
      // the number of lines reported.
      maxLogLines: 5, // default is unlimited

      // remove lines from the final report containing any of these
      // accepts strings. If you want to stop reporting dozens 
      // of lines that tell you nothing of value
      removeLinesContaining: ['@angular', 'zone.js'], // default is []

      // underline filename of some file type
      // All files in the error report that have this
      // particular extention will be underlined 
      underlineFileType: 'spec.ts', // default is ''

      // set custom color options for error report
      // will only work with numbers permitted in
      // https://github.com/medikoo/cli-color
      colorOptions: {
        testName: 0,  // default is 205
        browserName: 123, // default is 199
        firstLine: 225, // default is 211
        loggedErrors: 255 // default is 217
      },

      // hide from the final report the browser involved
      hideBrowser: true, // default is false

      // remove from the final report 
      // anything that follows '<-'
      // for example `blah blah <- test.ts 4250:39`
      // will become `blah blah`
      removeTail: true // default is false
    }
  });
};
```

In this release
-----------
 - Fix for [issue #23](https://github.com/dgarlitt/karma-nyan-reporter/issues/23) - Total tests count is different from other reporters
