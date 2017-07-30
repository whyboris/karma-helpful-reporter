'use strict';

var clc = require('cli-color');

var colorConsoleLogs = clc.xterm(45);

exports.setColorOptions = function(colorSettings) {
  colorConsoleLogs = clc.xterm(colorSettings.colorConsoleLogs);
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
    write(clc.green(stats.success + ' passed'));

    write(clc.move.right(inc));
    write(clc.red(stats.failed + ' failed'));

    write(clc.move.right(inc));
    write(clc.yellow(stats.skipped + ' skipped'));

    write('\n');
    write('\n');
    var finalLine = '';
    for (var i = 0; i < width + 1 ; i++) {
      // braille unicode dot in top-right corner
      finalLine = finalLine + '\u2808';
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
      // **** DON"T FORGET TO EDIT THIS ******
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
