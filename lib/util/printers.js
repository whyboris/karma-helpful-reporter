'use strict';

var clc = require('cli-color');

var colorConsoleLogs;
var colorPass;
var colorFail;
var colorSkip;

exports.setColorOptions = function (colorSettings) {
  colorConsoleLogs = clc.xterm(colorSettings.colorConsoleLogs);
  colorPass = clc.xterm(colorSettings.colorPass);
  colorFail = clc.xterm(colorSettings.colorFail);
  colorSkip = clc.xterm(colorSettings.colorSkip);
};

/**
 * printBrowserErrors - utility method
 *
 * relies on the reporter's context to print to the console
 * when a browser encounters a runtime compilation error
 */

exports.printRuntimeErrors =
  function printBrowserErrors(browserErrors) {
    if (browserErrors)  {
      var hashes = '##########'.split('');
      var rainbowifyEach = function(val) {
        write(val);
      };
      while (hashes.length > 0) {
        hashes.forEach(rainbowifyEach);
        write('\n');
        hashes.pop();
      }
      browserErrors.forEach(function(errorObj) {
        write('\n');
        write(clc.red(errorObj.browser.name));
        write('\n');
        write(clc.red(errorObj.error));
        write('\n');
      });
      write('\n');
      hashes.push('#');
      while(hashes.length <= 10) {
        hashes.forEach(rainbowifyEach);
        write('\n');
        hashes.push('#');
      }
      write('\n');
    }
  };

/**
 * printTestFailures - utility method
 *
 * relies on the reporter's context to print to the console
 * on each test failure in the test suite
 */

exports.printTestFailures =
  function printTestFailures(failedSuites) {
    if (failedSuites && failedSuites.length) {
      failedSuites.forEach(function(suite) {
        write(suite.toString());
      });
    }
  };

/**
 * printStats
 *
 * prints the summary of the test run
 */

exports.printStats =
  function printStats(stats, width) {
    var inc = 3;

    write(clc.move.right(inc));
    write(colorPass(stats.success + ' passed'));

    write(clc.move.right(inc));
    write(colorFail(stats.failed + ' failed'));

    write(clc.move.right(inc));
    write(colorSkip(stats.skipped + ' skipped'));

    write('\n');
    write('\n');
    var finalLine = '';
    for (var i = 0; i <= width; i++) {
      // braille unicode dot in top-right corner --> ⠉
      finalLine += '\u2808';
    }
    write(finalLine + '\n');

  };

/**
 * printBrowserLogs
 *
 * prints the console messages encountered by the browser
 * during the test run (console.log, console.info, etc...)
 */

exports.printBrowserLogs =
  function printBrowserLogs(browser_logs) {
    var printMsg = function(msg) {
      write('    ');
      write(colorConsoleLogs(msg));
      write('\n');
    };

    for (var browser in browser_logs) {
      // TODO -- make this more elegant
      write(' LOG MESSAGES FOR: ' + browser_logs[browser].name + ' INSTANCE #: ' + browser + '\n');
      browser_logs[browser].log_messages.forEach(printMsg);
    }

    write('\n');
  };

/**
 * write - utility method
 *
 * simple proxy of process.stdout.write
 */

var write =
      exports.write =
        function write(string) {
          process.stdout.write(string);
        };
