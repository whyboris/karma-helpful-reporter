'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var expect = chai.expect;
var eq = assert.equal;
var ok = assert.ok;

describe('util/draw.js test suite', function() {
  var sut;
  var module;
  var shellWidth;
  var shellHeight;
  var fakeColors;
  var fakeWrite;
  var clcFake;
  var shellFake;

  var xTermFake;

  beforeEach(function(done) {
    fakeWrite = sinon.spy();
    shellWidth = 100;
    shellHeight = 50;

    shellFake = {
      getWidth: sinon.stub(),
      getHeight: sinon.stub()
    };

    shellFake.getWidth.returns(shellWidth);
    shellFake.getHeight.returns(shellHeight);

    xTermFake = function(lol) {
      return {xterm: sinon.stub()};
    }

    clcFake = {
      bgXterm: sinon.spy(xTermFake),
      move: { 
        up: sinon.stub()
      },
      yellow: sinon.stub(),
      green: sinon.stub(),
      red: sinon.stub(),
      cyan: sinon.stub()
    };

    module = rewire('../lib/util/draw');

    module.__set__('clc', clcFake);
    module.__set__('write', fakeWrite);
    module.__set__('shell', shellFake);

    sut = module.getInstance();

    module.__set__('colorPass', sinon.stub());
    module.__set__('colorFail', sinon.stub());
    module.__set__('colorSkip', sinon.stub());

    module.__set__('frame', 33);

    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    shellWidth = null;
    fakeColors = null;
    fakeWrite = null;
    shellFake = null;
    clcFake = null;
    done();
  });

  // todo -- test actual value assignment
  describe('setColorOptions()', function () {
    it('should set color of pass, fail, and skip', function () {
      module.setColorOptions({ 'colorPass': 99, 'colorFail': 123, 'colorSkip': 123 });
      ok(module.__get__('clc').bgXterm.callCount === 3);
    });
  });

  // todo -- test actual value assignment
  describe('setAnimationStyle()', function () {
    it('should set animation style', function () {
      module.setAnimationStyle('braille');
      module.setAnimationStyle('clock');
      expect(module.__get__('progressAnimation')[0]).to.eq('\u2807 ');
      module.setAnimationStyle('braille2');
      expect(module.__get__('progressAnimation')[0]).to.eq('\u2807 ');
    });
  });

  // todo -- test actual behavior
  describe('animationFrame()', function () {
    it('should return animation frame depending on frameCounter', function () {
      module.__set__("frame", 4);
      sut.animationFrame();
      // expect to return a specific frame
    });
  });

  // todo -- test actual behavior
  describe('drawProgressBar()', function () {
    it('should draw drawProgressBar', function () {
      sut.drawProgressBar({success: 9, total: 10, skipped: 1, failed: 1});
    });
    it('should draw drawProgressBar', function () {
      sut.drawProgressBar({success: 10, total: 10, skipped: 0, failed: 0});
    });
  });

  // todo -- test actual behavior
  describe('drawChart()', function () {
    it('should draw chart in progress', function () {
      sut.drawChart({success: 2, total: 9, skipped: 1, failed: 3});
      // expect to call this.animationFrame()
      // expect to call write 3 times
    });
    it('should draw final chart', function () {
      sut.drawChart({success: 3, total: 9, skipped: 3, failed: 3});
      // expect to call this.finalEmoji()
      // expect to call write 3 times
    });
  });

  describe('drawThisMany()', function () {
    it('should draw this many', function () {
      var colorFail = function(str) {
        return str;
      };
      var optput = sut.drawThisMany(4, '+', colorFail);
      expect(optput).to.eq('++++');
    });
  });

  describe('finalEmoji()', function () {
    it('should return a poo emoji', function () {
      var emoji = sut.finalEmoji({ success: 4, skipped: 0, failed: 6, total: 10 });
      expect(emoji).to.eq('\u{1F4A9}');
    });
    it('should return a sad emoji', function () {
      var emoji = sut.finalEmoji({ success: 1, skipped: 5, failed: 4, total: 10 });
      expect(emoji).to.eq('\u{1F61E}');
    });
    it('should return a thumbs up emoji', function () {
      var emoji = sut.finalEmoji({ success: 4, skipped: 6, failed: 0, total: 10 });
      expect(emoji).to.eq('\u{1F44D}');
    });
    it('should return a grin emoji', function () {
      var emoji = sut.finalEmoji({ success: 10, skipped: 0, failed: 0, total: 10 });
      expect(emoji).to.eq('\u{1F44D}');
    });
    it('should return an ok hand emoji', function () {
      var emoji = sut.finalEmoji({ success: 5, skipped: 3, failed: 2, total: 10 });
      expect(emoji).to.eq('\u{1F44C}');
    });
  });

  // todo -- test actual behavior
  describe('cursorUp()', function () {
    it('should move cursor up', function () {
      sut.cursorUp(3);
      // expect clc.move.up to have been called 3 times
    });
  });

  // todo -- test actual behavior
  describe('cursorDown()', function () {
    it('should move cursor down', function () {
      sut.cursorDown(3);
      // expect 'write' to have been called 3 times with '/n'
    });
  });

});
