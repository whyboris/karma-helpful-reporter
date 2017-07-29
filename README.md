[![npm version](https://badge.fury.io/js/karma-helpful-reporter.svg)](http://badge.fury.io/js/karma-helpful-reporter)
[![Build Status](https://travis-ci.org/whyboris/karma-helpful-reporter.svg)](https://travis-ci.org/whyboris/karma-helpful-reporter)
[![Coverage Status](https://coveralls.io/repos/whyboris/karma-helpful-reporter/badge.svg?branch=master)](https://coveralls.io/r/whyboris/karma-helpful-reporter?branch=master)
[![Code Climate](https://codeclimate.com/github/whyboris/karma-helpful-reporter/badges/gpa.svg)](https://codeclimate.com/github/whyboris/karma-helpful-reporter)

karma-helpful-reporter
===

Karma Helpful Reporter was copied from [karma-nyan-reporter](https://github.com/dgarlitt/karma-nyan-reporter/) in July 2017 with intent to build on and improve its functionality. 

_Screenshot coming soon_

Installation
===

Install with npm:

```sh
npm install --save-dev karma-helpful-reporter
```

This package follows Karma's plugin naming convention; you can run your tests thus:

```sh
karma start path/to/karma.conf.js --reporters helpful
```

Output
===

The errors from failed tests are displayed hierarchically based on the test suite and nesting level. `console.log()` messages are output at the bottom below the test summary and grouped by browser.

_Screenshot coming soon_

Setup & Options
===

*Setup*: Inside your `karma.conf.js` 
 - include `require('karma-helpful-reporter'),` inside the `plugins` array
 - include `'helpful'` inside the `reporters` array

*Options*: optionally, add the `helpfulReporter` object with as many properties from the below set as you'd like.
 - The listed properties' values are the default ones

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ...
    plugins: [
    // ...
      require('karma-helpful-reporter'),
    // ...
    ],
    // ...
    reporters: [
    // ...
      'helpful'
    // ...
    ],
    // ...

    // Optional reporter settings
    helpfulReporter: {
      clearScreenBeforeEveryRun: false,
      hideBrowser: false,
      maxLogLines: 42,
      removeLinesContaining: [],
      removeTail: false,
      renderOnRunCompleteOnly: false,
      suppressErrorHighlighting: false,
      suppressErrorReport: false,
      underlineFileType: '',
      colorBrowser: 205,
      colorConsoleLogs: 45,
      colorFirstLine: 211,
      colorLoggedErrors: 250,
      colorTestName: 199,
      colorUnderline: 254,
    }
  });
};
```

Property | Default | Description
--- | --- | ---
clearScreenBeforeEveryRun | false | clear screen after every run happens before the Nyan cat is rendered
hideBrowser | false | hide from the final report the browser involved
maxLogLines | 42 | limit the number of lines of error shown No error occurs if this limit is longer than  the number of lines reported
removeLinesContaining | [] | remove lines from the final report containing any of these accepts strings. If you want to stop reporting dozens  of lines that tell you nothing of value, for example | ['@angular', 'zone.js']
removeTail | false | remove from the final report  anything that follows '<-' for example `blah blah <- test.ts 4250:39` will become `blah blah`
renderOnRunCompleteOnly | false | only render the graphic after all tests have finished. This is ideal for using this reporter in a continuous integration environment
suppressErrorHighlighting | false |  suppress the red background on errors in the error report at the end of the test run any line not containing `node_modules` is highlighted
suppressErrorReport | false | suppress the error report at the end of the test run
underlineFileType | '' | underline filename of some file type All files in the error report that have this particular extention will be underlined  fer example | 'spec.ts'
colorBrowser | 205 |  set custom color options for error report will only work with numbers permitted in htgithub.com/medikoo/cli-color
colorConsoleLogs | 45 | ^
colorFirstLine | 211 | ^
colorLoggedErrors | 250 | ^
colorTestName | 199 | ^
colorUnderline | 254 | ^

