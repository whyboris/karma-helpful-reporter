'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var eq = assert.equal;
var ok = assert.ok;

describe('printers.js test suite', function() {
  var sut;
  var module;
  var clcFake;
  var colorConsoleLogsFake;

  var colorPassFake;
  var colorFailFake;
  var colorSkipFake;

  beforeEach(function(done) {
    clcFake = {
      'red':          sinon.stub(),
      'cyan':         sinon.stub(),
      'green':        sinon.stub(),
      'move': {
        'right':      sinon.stub()
      },
      'blackBright':  sinon.stub(),
      'white':        sinon.stub(),
      'yellow':       sinon.stub(),
      'xterm':        sinon.stub()
    };

    colorConsoleLogsFake = sinon.stub();
    colorPassFake = sinon.stub();
    colorFailFake = sinon.stub();
    colorSkipFake = sinon.stub();

    sut = rewire('../lib/util/printers');
    sut.__set__('clc', clcFake);
    sut.__set__('colorConsoleLogs', colorConsoleLogsFake);
    sut.__set__('colorPass', colorPassFake);
    sut.__set__('colorFail', colorFailFake);
    sut.__set__('colorSkip', colorSkipFake);

    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    clcFake = null;
    done();
  });

  
  describe('setColorOptions()', function() {
    it('should set color of console logs', function() {
      sut.setColorOptions({"colorConsoleLogs": 99});
      ok(sut.__get__('clc').xterm.callCount === 4);
    });
  });

  /**
   * printBrowserErrors() tests
   */

  describe('printRuntimeErrors method tests', function() {
    var rainbowifyFake;
    var writeFake;
    var runtimeErrors;
    var out;

    beforeEach(function(done) {
      rainbowifyFake = sinon.stub();
      rainbowifyFake.returnsArg(0);
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      runtimeErrors = [{
        'browser': {
          'name': 'browser1'
        },
        'error': 'error1'
      },{
        'browser': {
          'name': 'browser2'
        },
        'error': 'error2'
      }];

      out = '#,#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,\n,' +
            '#,#,#,#,\n,' +
            '#,#,#,\n,' +
            '#,#,\n,' +
            '#,\n,' +
            '\n,' +
            runtimeErrors[0].browser.name + ',' +
            '\n,' +
            runtimeErrors[0].error + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[1].browser.name + ',' +
            '\n,' +
            runtimeErrors[1].error + ',' +
            '\n,' +
            '\n,' +
            '#,\n,' +
            '#,#,\n,' +
            '#,#,#,\n,' +
            '#,#,#,#,\n,' +
            '#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,#,\n,' +
            '\n';

      out = out.split(',');

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      runtimeErrors = null;
      writeFake = null;
      out = null;
      done();
    });

    it('should call write the expected number of times', function() {
      var hashCount = 0;
      var total = 0;

      clcFake.red.returnsArg(0);

      sut.printRuntimeErrors(runtimeErrors);

      for (var i = 0; i < out.length; i++) {
        ++total;
        if (out[i] === '#') {
          ++hashCount;
        }
        ok(writeFake.getCall(i).calledWithExactly(out[i]));
      }

      eq(total, writeFake.callCount);

      eq(4, clcFake.red.callCount);
      ok(clcFake.red.getCall(0).calledWithExactly(runtimeErrors[0].browser.name));
      ok(clcFake.red.getCall(1).calledWithExactly(runtimeErrors[0].error));
      ok(clcFake.red.getCall(2).calledWithExactly(runtimeErrors[1].browser.name));
      ok(clcFake.red.getCall(3).calledWithExactly(runtimeErrors[1].error));
    });
  });

  /**
   * printTestFailures() tests
   */

  describe('printTestFailures method tests', function() {

    var writeFake;

    beforeEach(function(done){
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      done();
    });

    it('should call write as expected when failedSuites is not null', function() {
      sut.printTestFailures([1,2,3]);
      eq(3, writeFake.callCount);
    });

    it('should NOT call write when failedSuites is empty', function() {
      sut.printTestFailures([]);
      ok(writeFake.notCalled);
    });

    it('should NOT call write when failedSuites is undefined', function() {
      sut.printTestFailures();
      ok(writeFake.notCalled);
    });

  });

  /**
   * printStats() tests
   */

  describe('printStats method tests', function() {

    var writeFake;
    var stats;
    var tab;

    beforeEach(function(done) {
      tab = '   ';
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      stats = {
        'total': 10,
        'success': 3,
        'failed': 2,
        'skipped': 5
      };

      clcFake.move.right.returns(tab);
      colorPassFake.withArgs(stats.success + ' passed').returns('10>' + stats.success);
      colorFailFake.withArgs(stats.failed + ' failed').returns('9>' + stats.failed);
      colorSkipFake.withArgs(stats.skipped + ' skipped').returns('11>' + stats.skipped);

      sut.__set__('write', writeFake);

      sut.printStats(stats, 130);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      clcFake = null;
      done();
    });

    it('should call write the expected number of times', function() {
      eq(9, writeFake.callCount);
    });

    it('should call clc.move.right as expected', function() {
      eq(3, clcFake.move.right.callCount);
      ok(clcFake.move.right.firstCall.calledWithExactly(3));
      ok(clcFake.move.right.secondCall.calledWithExactly(3));
      ok(clcFake.move.right.thirdCall.calledWithExactly(3));
    });

    it('should call write with the expected arguments', function() {
      ok(writeFake.getCall(0).calledWithExactly(tab));
      ok(writeFake.getCall(1).calledWithExactly('10>' + stats.success));
      ok(writeFake.getCall(2).calledWithExactly(tab));
      ok(writeFake.getCall(3).calledWithExactly('9>' + stats.failed));
      ok(writeFake.getCall(4).calledWithExactly(tab));
      ok(writeFake.getCall(5).calledWithExactly('11>' + stats.skipped));
      ok(writeFake.getCall(6).calledWithExactly('\n'));
      ok(writeFake.getCall(7).calledWithExactly('\n'));
    });
  });

  /**
   * printBrowserLogs() tests
   */

  describe('printBrowserLogs method tests', function() {

    var writeFake;
    var fakeLogs;

    beforeEach(function(done){
      writeFake = sinon.stub();
      fakeLogs = [{
          'name' : 'browser1',
          'log_messages' : ['msg1a', 'msg1b']
        }, {
          'name' : 'browser2',
          'log_messages' : ['msg2a', 'msg2b']
      }];

      writeFake.returnsArg(0);

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      fakeLogs = null;
      done();
    });

    it('should call write for each browser and 3 times for each log message', function() {
      sut.printBrowserLogs(fakeLogs);
      eq(15, writeFake.callCount);
    });

    it('should call write with the expected arguments', function() {
      var msg;
      colorConsoleLogsFake.returnsArg(0);

      sut.printBrowserLogs(fakeLogs);

      eq(4, colorConsoleLogsFake.callCount);

      msg = ' LOG MESSAGES FOR: browser1 INSTANCE #: 0\n';
      ok(writeFake.getCall(0).calledWithExactly(msg));
      ok(writeFake.getCall(1).calledWithExactly('    '));
      ok(writeFake.getCall(2).calledWithExactly('msg1a'));
      ok(writeFake.getCall(3).calledWithExactly('\n'));
      ok(writeFake.getCall(4).calledWithExactly('    '));
      ok(writeFake.getCall(5).calledWithExactly('msg1b'));
      ok(writeFake.getCall(6).calledWithExactly('\n'));

      msg = ' LOG MESSAGES FOR: browser2 INSTANCE #: 1\n';
      ok(writeFake.getCall(7).calledWithExactly(msg));
      ok(writeFake.getCall(8).calledWithExactly('    '));
      ok(writeFake.getCall(9).calledWithExactly('msg2a'));
      ok(writeFake.getCall(10).calledWithExactly('\n'));
      ok(writeFake.getCall(11).calledWithExactly('    '));
      ok(writeFake.getCall(12).calledWithExactly('msg2b'));
      ok(writeFake.getCall(13).calledWithExactly('\n'));
    });

  });

  /**
   * write - method tests
   */

  describe('write - method tests', function() {
    var real;

    beforeEach(function(done) {
      real = process.stdout.write;
      process.stdout.write = sinon.stub();
      process.stdout.write.returnsArg(0);

      sut.write('Hello');
      done();
    });

    afterEach(function(done) {
      process.stdout.write = real;
      done();
    });

    it('should call process.stdout.write with the expected value', function() {
      ok(process.stdout.write.calledOnce);
      ok(process.stdout.write.calledWithExactly('Hello'));
    });
  });

});
