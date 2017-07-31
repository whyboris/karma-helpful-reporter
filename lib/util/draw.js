'use strict';

var clc = require('cli-color');
var write = require('./printers').write;
var shell = require('./shell').getInstance();

var colorPass;
var colorFail;
var colorSkip;

exports.setColorOptions = function (colorSettings) {
  colorPass = clc.bgXterm(colorSettings.colorPass);
  colorFail = clc.bgXterm(colorSettings.colorFail);
  colorSkip = clc.bgXterm(colorSettings.colorSkip);
};

// default animation is braille
// e.g. ⠋ ⠇ ⠦ ⠴ ⠸ ⠙
var progressAnimation = ['\u2807', '\u2826', '\u2834', '\u2838', '\u2819', '\u280b',
                         '\u280f', '\u2827', '\u2836', '\u283c', '\u2839', '\u281b'];

exports.setAnimationStyle = function (style) {
  if (style === 'clock') {
    // alternative to use -- emoji clock
    // 🕓
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

  var width = Math.ceil(shell.getWidth() * 0.7) | 0;
  this.tick = 0;

  // create a long line for above and below the progress indicator
  // 5 char leftOffset
  var topLine =    '     ';
  var bottomLine = '     ';
  // line is shorter than width to allow for animation area
  for (var i = 0; i < width - 4; i++) {
    topLine += '_';
    bottomLine += '‾';
  }

  // renders the progress bar with its colors
  this.drawProgressBar = function (stats) {
    // 5 characters reserved for animation area - leftOffset
    var passWidth = Math.ceil((width - 5) * stats.success / stats.total);
    var failWidth = Math.ceil((width - 5) * stats.failed / stats.total);
    var skipWidth = Math.ceil((width - 5) * stats.skipped / stats.total);

    var difference = width - (passWidth + failWidth + skipWidth);
    if (difference > 0) {
      // subtract the overflow from the longest bar
      var largestOne = Math.max([passWidth, failWidth, skipWidth]);
      if (passWidth === largestOne) {
        passWidth = passWidth - difference;
      } else if (failWidth === largestOne) {
        failWidth = failWidth - difference;
      } else if (skipWidth === largestOne) {
        skipWidth = skipWidth - difference;
      }
    }

    return this.drawThisMany(passWidth, 'o', 'pass') +
           this.drawThisMany(failWidth, 'X', 'fail') +
           this.drawThisMany(skipWidth, '-', 'skip');
  };

  // draw `n` many of `char` in color of `style`
  this.drawThisMany = function (n, char, style) {
    var outputString = '';
    for (var i = 0; i < n; i++) {
      outputString += char;
    }
    var finalColor;
    if (style === 'pass') {
      return colorPass(outputString);
    } else if (style === 'fail') {
      return colorFail(outputString);
    } else if (style === 'skip') {
      return colorSkip(outputString);
    }
  };

  // draws the chart during progress and on final run
  this.drawChart = function (stats) {
    write(topLine + '\n');
    // Determine if `in progress` or final render
    if (stats.success + stats.failed + stats.skipped === stats.total) {
      write(' ' + this.finalEmoji(stats) + '   ' + this.drawProgressBar(stats) + ' \n');
    } else {
      write(' ' + animationFrame() + '   ' + this.drawProgressBar(stats) + ' \n');
    }
    write(bottomLine + '\n');
    this.cursorUp(3);
  };

  this.finalEmoji = function (stats) {
    // default is hand `ok` symbol
    // 👌
    var result = '\u{1F44C}';

    if (stats.failed > stats.total / 2) {
      // smiling poo
      // 💩
      result = '\u{1F4A9}';
    } else if (stats.failed > stats.success) {
      // sad face
      // 😞
      result = '\u{1F61E}';
    } else if (stats.failed === 0 && stats.skipped !== 0) {
      // thumbs up
      // 👍
      result = '\u{1F44D}';
    } else if (stats.success === stats.total) {
      // grinning
      // 😁
      result = '\u{1F44D}';
    }

    return result;
  };

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
