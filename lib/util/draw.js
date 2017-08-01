'use strict';

var clc = require('cli-color');
var write = require('./printers').write;
var shell = require('./shell').getInstance();

var colorPass;
var colorFail;
var colorSkip;
var colorGraphOutline = clc.xterm(7);

var frame = 0;

exports.setColorOptions = function (colorSettings) {
  colorPass = clc.bgXterm(colorSettings.colorPass).xterm(colorSettings.colorPass);
  colorFail = clc.bgXterm(colorSettings.colorFail).xterm(colorSettings.colorFail);
  colorSkip = clc.bgXterm(colorSettings.colorSkip).xterm(colorSettings.colorSkip);
};

// default animation is braille
// e.g. ⠋ ⠇ ⠦ ⠴ ⠸ ⠙
var progressAnimation = ['\u2807 ', '\u2826 ', '\u2834 ', '\u2838 ', '\u2819 ', '\u280b ',
                         '\u280f ', '\u2827 ', '\u2836 ', '\u283c ', '\u2839 ', '\u281b '];

exports.setAnimationStyle = function (style) {
  if (style === 'clock') {
    // alternative to use -- emoji clock
    // 🕓
    progressAnimation = ['\u{1F55B} ', '\u{1F550} ', '\u{1F551} ', '\u{1F552} ', '\u{1F553} ', '\u{1F554} ',
                         '\u{1F555} ', '\u{1F556} ', '\u{1F557} ', '\u{1F558} ', '\u{1F559} ', '\u{1F55A} ' ];
  } else if (style === 'braille2') {
    // alternative to use -- two character braille
    var progressAnimation = [ '\u2807 ', '\u2846 ', '\u28C4 ', '\u28C0\u2880', '\u2840\u28C0', ' \u28E0',
                              ' \u28B0', ' \u2838', ' \u2819', '\u2808\u2809', '\u2809\u2801', '\u280B ' ]
  }
};


function DrawUtil() {

  var width = Math.ceil(shell.getWidth() * 0.7) | 0;
  this.tick = 0;

  /**
   * Returns colorized bar for the chart 
   * @param {Object} stats - object containing 'success, failed, skipped, total'
   * @returns {string}     - colorized string containing success, fail, and skipped
   */
  this.drawProgressBar = function (stats) {
    // array of widths for pass, fail, and skip -- in that order
    var widths = new Array();
    // 5 characters reserved for animation area - leftOffset
    widths[0] = Math.ceil((width - 5) * stats.success / stats.total);
    widths[1] = Math.ceil((width - 5) * stats.failed / stats.total);
    widths[2] = Math.ceil((width - 5) * stats.skipped / stats.total);

    var difference = width - (widths[0] + widths[1] + widths[2]);
    if (difference > 0) {
      // Subtract the overflow from the longest width
      widths[widths.indexOf(Math.max(widths))] -= difference;
    }

    return this.drawThisMany(widths[0], 'o', colorPass) +
      this.drawThisMany(widths[1], 'X', colorFail) +
      this.drawThisMany(widths[2], '-', colorSkip);
  };

  /**
   * Return a string of the same character with color and background color chosen
   * @param {number} n      - the number of times to repeat a character
   * @param {string} char   - the character to repeat
   * @param {color}  color  - the color to make the character
   * @returns {string}      - colorized string of n many of chosen string
   */
  this.drawThisMany = function (n, char, color) {
    var outputString = '';
    for (var i = 0; i < n; i++) {
      outputString += char;
    }
    return color(outputString);
  };

  /**
   * Return the appropriate animation frame
   * @return {string} the frame of the animation
   */
  this.animationFrame = function () {
    frame++;
    if (frame > 11) {
      frame -= 12;
    }
    return progressAnimation[frame];
  }

  // Create a long line for above and below the progress indicator; includes 5 char leftOffset
  var topLine =    '     ' + this.drawThisMany(width - 4, '_', colorGraphOutline);
  var bottomLine = '     ' + this.drawThisMany(width - 4, '‾', colorGraphOutline);

  /**
   * Renders the final chart with colors, animation, and final emoji on final run 
   * @param {Object} stats - object containing 'success, failed, skipped, total'
   * @returns {void}
   */
  this.drawChart = function (stats) {
    write(topLine + '\n');
    // Determine if `in progress` or final render
    if (stats.success + stats.failed + stats.skipped === stats.total) {
      write(' ' + this.finalEmoji(stats) + '   ' + this.drawProgressBar(stats) + ' \n');
    } else {
      write(' ' + this.animationFrame()  +  '  ' + this.drawProgressBar(stats) + ' \n');
    }
    write(bottomLine + '\n');
    this.cursorUp(3);
  };

  /**
   * Return appropriate emoji based on test results
   * @param {Object} stats - object containing 'success, failed, skipped, total'
   * @returns {string}     - single emoji character
   */
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
