'use strict';

var clc = require('cli-color');
var write = require('./printers').write;
var shell = require('./shell').getInstance();

var animationStyle;
// default animation is braille
var progressAnimation = ['\u2807', '\u2826', '\u2834', '\u2838', '\u2819', '\u280b',
                         '\u280f', '\u2827', '\u2836', '\u283c', '\u2839', '\u281b'];

exports.setAnimationStyle = function (style) {
  if (style === 'clock') {
    // alternative to use -- emoji clock
    progressAnimation = ['\u{1F55B}', '\u{1F550}', '\u{1F551}', '\u{1F552}', '\u{1F553}', '\u{1F554}',
                         '\u{1F555}', '\u{1F556}', '\u{1F557}', '\u{1F558}', '\u{1F559}', '\u{1F55A}' ];
  }
};

var frameCounter = 0;


function animationFrame() {
  frameCounter++;
  if (frameCounter > 11) {
    frameCounter = frameCounter - 12;
  }
  return progressAnimation[frameCounter];
}

function DrawUtil() {

  // ---------------------------------------------------
  // Variables
  // ---------------------------------------------------

  // offset from the left side where the progress bar starts
  this.leftOffset = 5;

  var width = Math.ceil(shell.getWidth() * 0.7) | 0;
  this.tick = 0;

  // create a long line for above and below the progress indicator
  var topLine = '     ';
  var bottomLine = '     ';
  for (var i = 0; i < width - 4; i++) {
    topLine = topLine + '_';
    bottomLine = bottomLine + '‾';
  }

  // ---------------------------------------------------
  // Useful functions
  // ---------------------------------------------------

  // renders the progress bar with its colors
  this.drawProgressBar = function(stats) {

    var successWidth = Math.ceil((width - 5) * stats.success / stats.total);
    var failedWidth = Math.ceil((width - 5) * stats.failed / stats.total);
    var skippedWidth = Math.ceil((width - 5) * stats.skipped / stats.total);

    var difference = width - successWidth + failedWidth + skippedWidth;
    if (difference > 0 ) {
      var largestOne = Math.max([successWidth, failedWidth, skippedWidth]);
      if (successWidth === largestOne) {
        successWidth = successWidth - difference;
      } else if (failedWidth === largestOne) {
        failedWidth = failedWidth - difference;
      } else if (skippedWidth === largestOne) {
        skippedWidth = skippedWidth - difference;
      }
    }

    return this.drawThisMany(successWidth, ' ', 118, 'green') + this.drawThisMany(failedWidth, ' ', 198, 'red') + this.drawThisMany(skippedWidth, ' ', 227, 'yellow');
  };

  // draw `n` many of `char` in `color` for font, and `bg` background
  this.drawThisMany = function(n, char, color, bg) {
    var outputString = '';
    var colorBrowser;
    if (bg === 'green') {
      colorBrowser = clc.bgGreen.xterm(color);
    } else if (bg === 'red') {
      colorBrowser = clc.bgRed.xterm(color);
    } else if (bg === 'yellow') {
      colorBrowser = clc.bgYellow.xterm(color);
    }
    for (var i = 0; i < n; i++) {
      outputString = outputString + char;
    }
    return colorBrowser(outputString);
  };

  // draws this during progress
  this.drawChart = function(stats) {
    write(topLine + '\n');

    // determine if `in progress` or final render
    if (stats.success + stats.failed + stats.skipped === stats.total) {
      // add unicode other than fire
      write(' ' + this.finalEmoji(stats) + '   ' + this.drawProgressBar(stats) + ' \n');
    } else {
      write(' ' + animationFrame() + '   ' + this.drawProgressBar(stats) + ' \n');
    }
    write(bottomLine + '\n');
    this.cursorUp(3);
  };

  // TODO -- improve rules for resulting emoji
  // final emoji depending on test performance
  this.finalEmoji = function(stats) {

    // default is hand `ok` symbol
    var result = '\u{1F44C}';

    if (stats.failed > stats.total / 2) {
      // smiling poo
      result = '\u{1F4A9}';
    } else if (stats.success === stats.total) {
      // thumbs up
      result = '\u{1F44D}';
    }

    return result;
  };


  // ---------------------------------------------------
  // Auxilary functions
  // ---------------------------------------------------
  this.cursorUp = function(n) {
    write(clc.move.up(n));
  };

  this.cursorDown = function(n) {
    for (var i = 0; i < n; i++ ) {
      write('\n');
    }
  };

}

exports.getInstance = function() {
  return new DrawUtil();
};
