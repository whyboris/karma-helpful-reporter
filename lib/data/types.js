'use strict';

var clc = require('cli-color');

/*
 * Suites are the top level data structure
 * they can contain sub-suites and/or tests
 * sub-suites, would therefore be able to
 * contain their own sub-suites and/or tests
 */

// Global properties
var counter = 0;
var tab = 3;
var tabs = function(depth) {
  return clc.move.right(depth * tab + 1);
};

var fileExtension;

var showBrowser = true;

var removeTheseLines = [];

var colorTestName;
var colorBrowser;
var colorFirstLine;

var errorHighlightingEnabled = true;
var maxLines;

exports.suppressErrorHighlighting = function() {
  errorHighlightingEnabled = false;
};

var errorFormatterMethod = function(error) {
  return error.replace(/(\?.+?:)/, ':').trim();
};

exports.setErrorFormatterMethod = function(formatterMethod) {
  errorFormatterMethod = formatterMethod;
};

exports.setMaxLogLines = function(maxLogLines) {
  maxLines = maxLogLines;
};

exports.setLinesToExclude = function(linesToExclude) {
  removeTheseLines = linesToExclude;
};

exports.setFileTypeToUnderline = function(fileType) {
  if(fileType) {
    fileExtension = fileType;
  }
};

exports.hideBrowser = function() {
  showBrowser = false;
};

exports.resetCounter = function() {
  counter = 0;
};

exports.setColorOptions = function(colorSettings) {
  if (colorSettings.firstLine) {
    colorFirstLine = clc.xterm(colorSettings.firstLine);
  }
  if (colorSettings.testName) {
    colorTestName = clc.xterm(colorSettings.testName);
  }
  if (colorSettings.browserName) {
    colorBrowser = clc.xterm(colorSettings.browserName);
  }
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
  var firstElementPrinted = false;
  var out = [];

  if (showBrowser) {
    out.push(tabs(this.depth) + colorBrowser(this.name));
  }

  if (this.errors && maxLines) {
    this.errors = this.errors.slice(0, maxLines);
  }

  this.errors.forEach(function(error, i) {
    error = error.trim();
    error = errorFormatterMethod(error).trim();

    if (error.length) {
      var excludeThisLine = false;

      removeTheseLines.forEach(function(element) {
        if(error.indexOf(element) > -1) {
          excludeThisLine = true
        }
      });

      if (!excludeThisLine) {

        if (firstElementPrinted === false) {
          
          out.push(tabs(depth + 1) + (++counter) + ') ' + colorFirstLine(error));
          firstElementPrinted = true;

          if (fileExtension) {
            // match everything after the last '/' and the file extension
            var regExp = new RegExp('([^\/]*.' + fileExtension + ')');
            var matchingFile = error.match(regExp);
            if (matchingFile !== null) {
              error = error.replace(matchingFile[0], colorUnderline(matchingFile[0]));
            }
          }

        } else {
          if (error.indexOf('node_modules/') < 0 && errorHighlightingEnabled) {
            error = clc.black.bgRed(error);
          } else {
            error = clc.blackBright(error);
          }
          out.push(tabs(depth + 2) + error);
        }
      }
    }
  });

  return out.join('\n');
};

exports.Suite = Suite;
exports.Test = Test;
exports.Browser = Browser;
