'use strict';

var clc = require('cli-color');

/*
 * Suites are the top level data structure
 * they can contain sub-suites and/or tests
 * sub-suites, would therefore be able to
 * contain their own sub-suites and/or tests
 */

// Global properties alphabetized
var clearScreenBeforeEveryRun = false;
var counter = 0;
var errorHighlightingEnabled = true;
var fileExtension;
var maxLines = 9999;
var removeTail = false;
var removeTheseLines = [];
var showBrowser = true;
var tab = 3;
var tabs = function(depth) {
  return clc.move.right(depth * tab + 1);
};

// Color variables
var colorBrowser = clc.xterm(205);
var colorFirstLine = clc.xterm(211);
var colorLoggedErrors = clc.xterm(250);
var colorTestName = clc.xterm(199);
var colorUnderline = clc.xterm(254);

var errorFormatterMethod = function(error) {
  return error.replace(/(\?.+?:)/, ':').trim();
};

// Exported methods alphabetized
exports.clearScreen = function() {
  process.stdout.write(clc.erase.screen);
};

exports.clearScreenBeforeEveryRun = function() {
  clearScreenBeforeEveryRun = true;
};

exports.hideBrowser = function() {
  showBrowser = false;
};

exports.removeTail = function() {
  removeTail = true;
};

exports.resetCounter = function() {
  if (clearScreenBeforeEveryRun) {
    process.stdout.write(clc.erase.screen);
  }
  counter = 0;
};

exports.setColorOptions = function(colorSettings) {
  colorBrowser = clc.xterm(colorSettings.colorBrowser);
  colorFirstLine = clc.xterm(colorSettings.colorFirstLine);
  colorLoggedErrors = clc.xterm(colorSettings.colorLoggedErrors);
  colorTestName = clc.xterm(colorSettings.colorTestName);
  colorUnderline = clc.underline.xterm(colorSettings.colorUnderline);
};

exports.setErrorFormatterMethod = function(formatterMethod) {
  errorFormatterMethod = formatterMethod;
};

exports.setFileTypeToUnderline = function(fileType) {
  if (fileType) {
    fileExtension = fileType;
  }
};

exports.setLinesToExclude = function(linesToExclude) {
  removeTheseLines = linesToExclude;
};

exports.setMaxLogLines = function(maxLogLines) {
  if (maxLogLines) {
    maxLines = maxLogLines;
  }
};

exports.suppressErrorHighlighting = function() {
  errorHighlightingEnabled = false;
};

/**
 * Suite - Class
 *
 * Stores info about the sub-suites and tests that
 * failed resulting from a test run.
 * Knows how to output itself to a string.
 */

function Suite(name) {
  this.name = name.trim();
  this.depth = 0;
  this.suites = [];
  this.tests = [];
}

Suite.prototype.toString = function() {
  var out = [];

  if (this.depth === 0) {
    out.push(tabs(this.depth) + clc.white.underline(this.name));
  } else {
    out.push(tabs(this.depth) + clc.white(this.name));
  }

  this.tests.forEach(function(test) {
    out.push(test.toString().trim());
    out.push('');
  });

  this.suites.forEach(function(suite) {
    out.push(suite.toString().trim());
    out.push('');
  });

  out.push('');
  out.push('');

  out = out.join('\n');

  return out;
};


/**
 * Test - Class
 *
 * stores information about each tst failure
 * resulting from a test run.
 * Knows how to output itself to a string.
 */

function Test(name) {
  this.name = name.trim();
  this.depth = 0;
  this.browsers = [];
}

Test.prototype.toString = function() {
  var out = [];

  out.push(tabs(this.depth) + colorTestName(this.name));

  this.browsers.forEach(function(browser) {
    out.push(browser.toString().trim());
  });

  return out.join('\n');
};


/**
 * Browser - Class
 *
 * stores information for each browser failure
 * resulting from a test run.
 * Knows how to output itself to a string.
 */

function Browser(name) {
  this.name = name.trim();
  this.depth = 0;
  this.errors = [];
}

Browser.prototype.toString = function() {
  var depth = this.depth;
  var linesPrinted = 0;
  var out = [];

  if (showBrowser) {
    out.push(tabs(this.depth) + colorBrowser(this.name));
  } else {
    depth = depth - 1;
  }

  this.errors.forEach(function(error, i) {

    error = error.trim();
    error = errorFormatterMethod(error).trim();

    if (linesPrinted < maxLines && error.length) {

      var excludeThisLine = false;

      removeTheseLines.forEach(function(element) {
        if (error.indexOf(element) > -1) {
          excludeThisLine = true
        }
      });

      if (!excludeThisLine) {

        if (removeTail) {
          error = error.replace(/(<-.*)/, '');
        }

        if (fileExtension) {
          // match everything after the last '/' and the file extension
          var regExp = new RegExp('([^\/]*.' + fileExtension + ')');
          var matchingFile = error.match(regExp);
          if (matchingFile !== null) {
            error = error.replace(matchingFile[0], colorUnderline(matchingFile[0]));
          }
        }

        if (linesPrinted === 0) {
          out.push(tabs(depth + 1) + (++counter) + ') ' + colorFirstLine(error));
        } else {
          if (error.indexOf('node_modules/') < 0 && errorHighlightingEnabled) {
            error = clc.black.bgRed(error);
          } else {
            error = colorLoggedErrors(error);
          }
          out.push(tabs(depth + 2) + error);
        }
        linesPrinted++;
      }
    }
  });

  return out.join('\n');
};

exports.Suite = Suite;
exports.Test = Test;
exports.Browser = Browser;
