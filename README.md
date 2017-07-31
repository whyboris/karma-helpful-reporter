[![npm version](https://badge.fury.io/js/karma-helpful-reporter.svg)](http://badge.fury.io/js/karma-helpful-reporter)
[![Build Status](https://travis-ci.org/whyboris/karma-helpful-reporter.svg)](https://travis-ci.org/whyboris/karma-helpful-reporter)
[![Coverage Status](https://coveralls.io/repos/github/whyboris/karma-helpful-reporter/badge.svg?branch=karma-helpful-reporter)](https://coveralls.io/github/whyboris/karma-helpful-reporter?branch=karma-helpful-reporter)
[![Code Climate](https://codeclimate.com/github/whyboris/karma-helpful-reporter/badges/gpa.svg)](https://codeclimate.com/github/whyboris/karma-helpful-reporter)
[![Dependency Status](https://david-dm.org/whyboris/karma-helpful-reporter.svg)](https://david-dm.org/whyboris/karma-helpful-reporter)

karma-helpful-reporter
===

Karma Helpful Reporter gives you a customizable report after you run your Karma tests.

![karma-helpful-reporter](https://user-images.githubusercontent.com/17264277/28763978-fcc6466c-758f-11e7-9343-b13933f15e88.png "Karma Helpful Reporter")

The errors from failed tests are displayed hierarchically based on the test suite and nesting level. `console.log()` messages are output at the bottom below the test summary and grouped by browser.

Setup & Options
===

Install with npm:

```sh
npm install --save-dev karma-helpful-reporter
```

Inside your `karma.conf.js` 
 - add `require('karma-helpful-reporter')` to the `plugins` array
 - add `'helpful'` to the `reporters` array

Optionally, add the `helpfulReporter` object with as many properties from the below set as you'd like.
 - The listed properties' values are the default ones

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: [ require('karma-helpful-reporter') ],
    reporters: [ 'helpful' ],

    // Optional reporter settings
    helpfulReporter: {
      animationStyle: 'braille',
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
      colorFail: 9,
      colorFirstLine: 211,
      colorLoggedErrors: 250,
      colorPass: 10,
      colorSkip: 11,
      colorTestName: 199,
      colorUnderline: 254,
    }
  });
};
```


Property | Default | Description
--- | --- | ---
animationStyle | 'braille' | Set in-progress animation to _'braille'_, _'braille2'_, or emoji _'clock'_.
clearScreenBeforeEveryRun | false | Clear screen before every run
hideBrowser | true | Hide browser name from the report
maxLogLines | 42 | Limit the maximum number of lines in report
removeLinesContaining | [] | Remove all lines from the final report containing any of these strings, e.g. _['@angular', 'zone.js']_
removeTail | false | Remove from the final report anything that follows '<-', e.g. _blah blah <- test.ts 4250:39_ becomes _blah blah_
renderOnRunCompleteOnly | false | Do not animate while tests are running
suppressErrorHighlighting | false | Highlight in red all lines not containing _node_modules_
suppressErrorReport | false | Suppress the error report at the end of the test run
underlineFileType | '' | Underline filename of some file type; all files in the error report that have this particular extention will be underlined, e.g. _'spec.ts'_; set the color with the _colorUnderline_ property
colorBrowser | 224 | <img src="http://medyk.org/colors/ffd7d7.png" style="border: 1px solid black" width="20" height="20" /> 
colorConsoleLogs | 45 | <img src="http://medyk.org/colors/00d7ff.png" style="border: 1px solid black" width="20" height="20" />
colorFail | 210 | <img src="http://medyk.org/colors/ff8787.png" style="border: 1px solid black" width="20" height="20" /> 
colorFirstLine | 217 | <img src="http://medyk.org/colors/ffafaf.png" style="border: 1px solid black" width="20" height="20" />
colorLoggedErrors | 250 | <img src="http://medyk.org/colors/bcbcbc.png" style="border: 1px solid black" width="20" height="20" />
colorPass | 154 | <img src="http://medyk.org/colors/afff00.png" style="border: 1px solid black" width="20" height="20" /> 
colorSkip | 117 | <img src="http://medyk.org/colors/87d7ff.png" style="border: 1px solid black" width="20" height="20" /> 
colorTestName | 210 | <img src="http://medyk.org/colors/ff8787.png" style="border: 1px solid black" width="20" height="20" />
colorUnderline | 255 | <img src="http://medyk.org/colors/eeeeee.png" style="border: 1px solid black" width="20" height="20" />

Set custom colors by using permitted [cli-color](https://github.com/medikoo/cli-color) numbers.

Notes
===

This project was copied from [karma-nyan-reporter](https://github.com/dgarlitt/karma-nyan-reporter/) in July 2017 with intent to build on and improve its functionality. Code cleanup and refactoring will happen during August 2017.
