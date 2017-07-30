'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var expect = chai.expect;
var assert = chai.assert;
var ok = assert.ok;
var eq = assert.equal;

describe('util/draw.js test suite', function() {
  var sut;
  var module;
  var shellWidth;
  var shellHeight;
  var fakeColors;
  var fakeWrite;
  var clcFake;
  var shellFake;

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

    clcFake = {
      move: { 
        up: sinon.stub()
      },
      yellow: sinon.stub(),
      green: sinon.stub(),
      red: sinon.stub(),
      cyan: sinon.stub()
    };

    module = rewire('../lib/util/draw');

    module.__set__('shell', shellFake);

    module.__set__('clc', clcFake);
    module.__set__('write', fakeWrite);

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

  describe('instantiation tests', function() {
    it('should set the defaults values appropriately', function() {
      var expected, actual;

      eq(5, sut.scoreboardWidth);
      eq(0, sut.tick);
      assert.deepEqual([[], [], [], []], sut.trajectories);

      expected = (shellWidth * 0.75 | 0);
      actual = sut.trajectoryWidthMax;
      eq(expected, actual);
    });
  });

  /**
   * drawScoreboard() tests
   */

  describe('drawScoreboard method tests', function() {
    var colors;
    var stats;

    beforeEach(function(done) {
      stats = {
        'total': 11,
        'success': 33,
        'failed': 66,
        'skipped': 99
      };

      sut.cursorUp = sinon.spy();

      clcFake.yellow.withArgs(stats.total).returns('yellow>' + stats.total);
      clcFake.green.withArgs(stats.success).returns('green>' + stats.success);
      clcFake.red.withArgs(stats.failed).returns('red>' + stats.failed);
      clcFake.cyan.withArgs(stats.skipped).returns('cyan>' + stats.skipped);

      sut.drawChart(stats);
      done();
    });

    afterEach(function(done) {
      colors = null;
      stats = null;
      done();
    });

    it('should call the write method with the correct values', function() {
      var expected;

      eq(4, fakeWrite.callCount);

      expected = ' yellow>' + stats.total + '\n';
      ok(fakeWrite.getCall(0).calledWithExactly(expected));

      expected = ' green>' + stats.success + '\n';
      ok(fakeWrite.getCall(1).calledWithExactly(expected));

      expected = ' red>' + stats.failed + '\n';
      ok(fakeWrite.getCall(2).calledWithExactly(expected));

      expected = ' cyan>' + stats.skipped + '\n';
      ok(fakeWrite.getCall(3).calledWithExactly(expected));
    });
  
  });

  /**
   * cursorUp() tests
   */

  describe('cursorUp method tests', function() {
    it('should call write with the expected values', function() {
      var arg = 'blah';

      clcFake.move.up.returns('up');

      sut.cursorUp(arg);

      expect(fakeWrite.calledOnce).to.be.true;
      expect(fakeWrite.calledWithExactly('up')).to.be.true;
    });
  });

});
