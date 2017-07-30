'use strict';

var dataStore = require('./data/store');
var dataTypes = require('./data/types');
var drawUtil = require('./util/draw');
var printers = require('./util/printers');
var shellUtil = require('./util/shell').getInstance();
var fs = require('fs');

var delay = 1;

/**
 * Helpful constructor
 */

function Helpful(baseReporterDecorator, formatError, config) {
  var self = this;
  var defaultOptions = function() {
    return {
      clearScreenBeforeEveryRun: false,
      colorBrowser: 205,
      colorConsoleLogs: 45,
      colorFirstLine: 211,
      colorLoggedErrors: 250,
      colorTestName: 199,
      colorUnderline: 254,
      hideBrowser: true,
      maxLogLines: null,
      removeLinesContaining: [],
      removeTail: false,
      renderOnRunCompleteOnly: false,
      suppressErrorHighlighting: true,
      suppressErrorReport: false,
      underlineFileType: null
    };
  };

  self.options = defaultOptions();

  if (config && config.helpfulReporter) {
    // merge defaults
    Object.keys(self.options).forEach(function(optionName){
      if (config.helpfulReporter.hasOwnProperty(optionName)) {
        self.options[optionName] = config.helpfulReporter[optionName];
      }
    });
  }

  self.adapters = [fs.writeSync.bind(fs.writeSync, 1)];
  dataTypes.setErrorFormatterMethod(formatError);

  dataTypes.setColorOptions({
    colorBrowser: self.options.colorBrowser,
    colorFirstLine: self.options.colorFirstLine,
    colorLoggedErrors: self.options.colorLoggedErrors,
    colorTestName: self.options.colorTestName,
    colorUnderline: self.options.colorUnderline,
  });

  printers.setColorOptions({
    colorConsoleLogs: self.options.colorConsoleLogs,
  });

  if (self.options.hideBrowser) {
    dataTypes.hideBrowser();
  }

  if (self.options.maxLogLines) {
    dataTypes.setMaxLogLines(self.options.maxLogLines);
  }

  if (self.options.suppressErrorHighlighting) {
    dataTypes.suppressErrorHighlighting();
  }

  if (self.options.removeLinesContaining) {
    dataTypes.setLinesToExclude(self.options.removeLinesContaining);
  }

  if (self.options.underlineFileType) {
    dataTypes.setFileTypeToUnderline(self.options.underlineFileType);
  }

  if (self.options.removeTail) {
    dataTypes.removeTail();
  }

  if (self.options.clearScreenBeforeEveryRun) {
    dataTypes.clearScreenBeforeEveryRun();
  }

}


Helpful.prototype.reset = function() {
  dataTypes.resetCounter();
  this.allResults = {};
  this._browsers = [];
  this.browser_logs = {};
  this.browserErrors = [];
  this.colorIndex = 0;
  this.dataStore = dataStore.getInstance();
  this.drawUtil = drawUtil.getInstance();
  this.stats = {};

  this.totalTime = 0;
  this.numberOfSlowTests = 0;
};

/**
 * Draw the progress bar
 *
 * @api private
 */

Helpful.prototype.draw = function(animate){
  // @TODO -- alow users to disable animation
  this.drawUtil.drawChart(this.stats);
  this.drawUtil.tick = !this.drawUtil.tick;
};


/*******************************************************/
/*************** Karma LifeCycle Mehtods ***************/
/*******************************************************/

/**
 * onRunStart - karma api method
 *
 * called at the beginning of each test run
 */

Helpful.prototype.onRunStart = function (browsers) {
  shellUtil.cursor.hide();
  this.reset();
  this.numberOfBrowsers = (browsers || []).length;
  printers.write('\n');
};

/**
 * onBrowserLog - karma api method
 *
 * called each time a browser encounters a
 * console message (console.log, console.info, etc...)
 */

Helpful.prototype.onBrowserLog = function(browser, log) {
  if (!this.browser_logs[browser.id]) {
    this.browser_logs[browser.id] = {
      name: browser.name,
      log_messages: []
    };
  }

  this.browser_logs[browser.id].log_messages.push(log);
};

/**
 * onSpecComplete - karma api method
 *
 * called when each test finishes
 */

Helpful.prototype.onSpecComplete = function(browser, result) {
  // don't pollute original object
  this.stats = Object.create(browser.lastResult);

  // sum up tests stats
  var testStats = {
    success: 0,
    failed: 0,
    skipped: 0,
    total: 0
  };

  var matched = this._browsers.some(function(br, idx, all) {
    if (all[idx].id === browser.id) {
      return all.splice(idx, 1, browser);
    }
  });

  if (!matched) {
    this._browsers.push(browser);
  }

  this._browsers.forEach(function(br) {
    Object.keys(testStats).forEach(function(prop) {
      testStats[prop] += br.lastResult[prop];
    });
  });

  var self = this;
  Object.keys(testStats).forEach(function (prop) {
    self.stats[prop] = testStats[prop];
  });

  if (!this.options.suppressErrorReport) {
    this.dataStore.save(browser, result);
  }

  this.draw(this.options.renderOnRunCompleteOnly);
};

/**
 * onRunComplete - karma api method
 *
 * called either when a browser encounters
 * an error or when all tests have run
 */

Helpful.prototype.onRunComplete = function() {

  // TODO -- clean up this function
  this.draw();

  if (this.browserErrors.length) {
    printers.printRuntimeErrors(this.browserErrors);
  } else {

    this.drawUtil.cursorDown(4);

    printers.printTestFailures(this.dataStore.getData(), this.options.suppressErrorReport);

    printers.printBrowserLogs(this.browser_logs);

    // duplicated code -- compute width of final print report
    var finalLineWidth = Math.ceil(shellUtil.getWidth() * 0.7);
    printers.printStats(this.stats, finalLineWidth);

  }
  shellUtil.cursor.show();
};

/**
 * onBrowserStart - karma api method
 *
 * called when each browser is launched
 */

Helpful.prototype.onBrowserStart = function (browser) {
  this._browsers.push(browser);
  this.numberOfBrowsers = this._browsers.length;
};

/**
 * onBrowserError - karma api method
 *
 * called when a browser encounters a compilation
 * error at runtime
 */

Helpful.prototype.onBrowserError = function(browser, error) {
  this.browserErrors.push({'browser': browser, 'error': error});
};

exports.Helpful = Helpful;
