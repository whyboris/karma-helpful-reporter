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
      sut.drawProgressBar({success: 24, total: 145, skipped: 11, failed: 4});
    });
  });

  // todo -- test actual behavior
  describe('drawChart()', function () {
    it('should draw chart', function () {
      sut.drawChart({success: 24, total: 55, skipped: 11, failed: 4});
    });
  });

  // todo -- test actual behavior
  describe('drawThisMany()', function () {
    it('should draw this many', function () {
      // sut.drawThisMany(4, '+', colorFail);
    });
  });

  // todo -- test actual behavior
  describe('finalEmoji()', function () {
    it('should return an emoji', function () {
      sut.finalEmoji({success: 24, total: 55, skipped: 11, failed: 4});
      // expect to return some specific emoji
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
