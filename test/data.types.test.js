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

describe('data/types.js test suite', function() {
  var dt, clcFake, right;
  var tab = 3;

  beforeEach(function(done) {
    right = 'right>';

    clcFake = {
      'erase': sinon.stub(),
      'colorTestName': sinon.stub(),
      'colorUnderline': sinon.stub(),
      'white': sinon.stub(),
      'red': sinon.stub(),
      'yellow': sinon.stub(),
      'redBright': sinon.stub(),
      'blackBright': sinon.stub(),
      'move': {
        'right': sinon.stub()
      },
      'black': {
        'bgRed': sinon.stub()
      }
    };

    clcFake.move.right.returns(right);

    clcFake.colorTestName.returns(clcFake.colorTestName);

    clcFake.colorUnderline.returns(clcFake.colorUnderline);

    dt = rewire('../lib/data/types');
    dt.__set__('clc', clcFake);
    done();
  });

  /**
   * Individual functions tests
   */
  describe('individual functions', function() {
    var sut, name, suites, tests;

    beforeEach(function(done) {
      name = 'suite';
      suites = ['a', 'b', 'c'];
      tests = [1, 2, 3];

      sut = new dt.Suite(name);

      sut.suites = suites;
      sut.tests = tests;
      done();
    });

    describe('clearScreen()', function() {
      it('should call clc.erase.screen', function() {
        var clearFake = {
          'stdout': {
            'write': sinon.stub()
          }
        };
        var write = sinon.stub();
        clearFake.stdout.write.returns(write);
        dt.__set__('process', clearFake);
        dt.clearScreen();
        // fix test
        // ok(process.calledOnce);
      });
    });

    describe('clearScreenBeforeEveryRun()', function() {
      it('should set clearScreenBeforeEveryRun to true', function() {
        dt.__set__("clearScreenBeforeEveryRun", false);
        dt.clearScreenBeforeEveryRun();
        expect(dt.__get__("clearScreenBeforeEveryRun")).to.be.true;
      });
    });

    describe('hideBrowser()', function() {
      it('should set showBrowser to false', function() {
        dt.__set__("showBrowser", true);
        dt.hideBrowser();
        expect(dt.__get__("showBrowser")).to.be.false;
      });
    });

    describe('removeTail()', function() {
      it('should set removeTail to true', function() {
        dt.__set__("removeTail", false);
        dt.removeTail();
        expect(dt.__get__("removeTail")).to.be.true;
      });
    });

    describe('resetCounter()', function() {
      it('should set counter to 0', function() {
        dt.__set__("counter", 33);
        dt.resetCounter();
        expect(dt.__get__("counter")).to.equal(0);
      });
      
      it('should also clear screen if clearScreenBeforeEveryRun is true', function() {
        var clearFake = {
          'stdout': {
            'write': sinon.stub()
          }
        };
        var write = sinon.stub();
        clearFake.stdout.write.returns(write);
        dt.__set__('process', clearFake);

        dt.clearScreenBeforeEveryRun();
        dt.resetCounter();
        ok(dt.__get__('process').stdout.write.calledOnce);
      });
    });

    describe('setColorOptions()', function() {
      it('should set all color options', function() {
        var clcFake = {
          'xterm': sinon.stub(),
          'underline': {
            'xterm': sinon.stub()
          }
        }
        dt.__set__('clc', clcFake);
        dt.setColorOptions({
          colorBrowser: 44,
          colorFirstLine: 43,
          colorLoggedErrors: 2,
          colorTestName: 135,
          colorUnderline: 245
        });
        ok(dt.__get__('clc').xterm.callCount === 4);
        ok(dt.__get__('clc').underline.xterm.callCount === 1);
      });
    });

    describe('setFileTypeToUnderline()', function() {
      it('should update the fileExtension variable', function() {
        dt.__set__("fileExtension", "some string");
        dt.setFileTypeToUnderline(".spec.ts");
        expect(dt.__get__("fileExtension")).to.eq(".spec.ts");
      });
    });

    describe('setLinesToExclude()', function() {
      it('should update removeTheseLines array', function() {
        dt.__set__("removeTheseLines", ['a','b','c']);
        dt.setLinesToExclude(['string1','string2']);
        assert.deepEqual(dt.__get__("removeTheseLines"), ['string1','string2']);
      });
    });

    describe('setMaxLogLines()', function() {
      it('should update maxLines variable', function() {
        dt.__set__("maxLines", 3);
        dt.setMaxLogLines(9);
        expect(dt.__get__("maxLines")).to.eq(9);
      });
    });

    describe('suppressErrorHighlighting()', function() {
      it('should set errorHighlightingEnable to false', function() {
        dt.__set__("errorHighlightingEnabled", true);
        dt.suppressErrorHighlighting();
        expect(dt.__get__("errorHighlightingEnabled")).to.be.false;
      });
    });

  });

  /**
   * Suite - class tests
   */

  describe('Suite - class ', function() {
    var sut, name, suites, tests;

    beforeEach(function(done) {
      name = 'suite';
      suites = ['a', 'b', 'c'];
      tests = [1, 2, 3];

      sut = new dt.Suite(name);

      sut.suites = suites;
      sut.tests = tests;

      done();
    });

    it('should have the properties set correctly', function() {
      eq(name, sut.name);
      eq(0, sut.depth);
      eq(3, sut.suites.length);
      eq(3, sut.tests.length);
    });

    it('should return a string as expected when depth is 0', function() {
      var underlineFake = sinon.stub();
      underlineFake.returns('underline>' + sut.name);

      clcFake.white = {
        underline: underlineFake
      };

      var expected = [
        right + 'underline>' + name,
        tests.join('\n\n'),
        '',
        suites.join('\n\n'),
        '',
        '', ''
      ].join('\n');

      var actual = sut.toString();

      eq(expected, actual);
      ok(underlineFake.calledOnce);
      ok(underlineFake.calledWithExactly(name));
    });

    it('should return a string as expected when depth is > 0', function() {
      var actual, expected;

      clcFake.white.returns('white>' + sut.name);

      expected = [
        right + 'white>' + name,
        tests.join('\n\n'),
        '',
        suites.join('\n\n'),
        '',
        '', ''
      ].join('\n');

      sut.depth = 1;
      actual = sut.toString();

      eq(expected, actual);
      ok(clcFake.move.right.calledOnce);
      ok(clcFake.move.right.calledWithExactly(sut.depth * tab + 1));
      ok(clcFake.white.calledOnce);
      ok(clcFake.white.calledWithExactly(name));
    });
  });

  /**
   * Test - class tests
   */

  describe('Test - class ', function() {
    var sut, name, depth, browsers;

    beforeEach(function(done) {
      name = 'test';
      depth = 5;
      browsers = ['a', 'b', 'c'];

      sut = new dt.Test(name);

      sut.depth = depth;
      sut.browsers = browsers;

      sut.colorTestName = clcFake.colorTestName;

      done();
    });

    it('should have the properties set correctly', function() {
      eq(name, sut.name);
      eq(depth, sut.depth);
      eq(browsers, sut.browsers);
    });

    it('should return the expected string when toString is called', function() {
      var actual, expected;
      var redReturn = '\u001b[38;5;199m' + name + '\u001b[39m';
      clcFake.red.returns(redReturn);

      expected = [
        right + redReturn,
        browsers.join('\n')
      ].join('\n');

      actual = sut.toString();

      eq(expected, actual);
      ok(clcFake.move.right.calledOnce);
      ok(clcFake.move.right.calledWithExactly(depth * tab + 1));
      // ok(clcFake.red.calledOnce);
      // ok(clcFake.red.calledWithExactly(name));
    });
  });

  /**
   * Browser - class tests
   */

  describe('Browser - class ', function() {
    var sut, name, depth, errors;

    beforeEach(function(done) {
      name = 'browser';
      depth = 4;
      errors = ['Error Info', 'node_modules/y', 'z'];

      sut = new dt.Browser(name);
      sut.depth = depth;
      sut.errors = errors;

      sut.colorUnderline = clcFake.colorUnderline;

      done();
    });

    it('should have the properties set correctly', function() {
      eq(name, sut.name);
      eq(depth, sut.depth);
      eq(errors, sut.errors);
    });

    it('should call clc.move.right as expected when toString is called', function() {
      sut.toString();

      eq(4, clcFake.move.right.callCount);
      ok(clcFake.move.right.getCall(0).calledWithExactly(depth * tab + 1));
      ok(clcFake.move.right.getCall(1).calledWithExactly((depth + 1) * tab + 1));
      ok(clcFake.move.right.getCall(2).calledWithExactly((depth + 2) * tab + 1));
      ok(clcFake.move.right.getCall(3).calledWithExactly((depth + 2) * tab + 1));
    });

    it('should call the color methods on clc as expected when toString is called', function() {
      sut.toString();

      // ok(clcFake.yellow.calledOnce);
      // ok(clcFake.yellow.calledWithExactly(name));

      // ok(clcFake.redBright.calledOnce);
      // ok(clcFake.redBright.calledWithExactly(errors[0]));

      // ok(clcFake.blackBright.calledOnce);
      // ok(clcFake.blackBright.getCall(0).calledWithExactly(errors[1]));
      // ok(clcFake.black.bgRed.calledOnce);
      // ok(clcFake.black.bgRed.getCall(0).calledWithExactly(errors[2]));
    });

    it('should return the expected string when toString is called', function() {
      var expected, actual;
      var yellow = 'yellow>';
      var redBright = 'redBright>';
      var blackBright = 'blackBright>';
      var bgRed = 'bgRed>';

      clcFake.yellow.returns(yellow);
      clcFake.redBright.returns(redBright);
      clcFake.blackBright.returns(blackBright);
      clcFake.black.bgRed.returns(bgRed);

      expected = [
        right + yellow,
        right + '1) ' + redBright,
        right + blackBright,
        right + bgRed,
      ].join('\n');

      actual = sut.toString();

      // eq(expected, actual);
    });

    describe('errorHighlighting', function() {
      it('should not use black.bgRed when suppressErrorHighlighting is called', function() {
        sut.errors = [
          'Error Info',
          'error1',
          'error2'
        ];

        dt.suppressErrorHighlighting();
        sut.toString();

        //ok(clcFake.blackBright.calledTwice);
      });
    });

    describe('setMaxLogLines', function() {
      it('should set limit to lines when setMaxLogLines is called', function() {
        dt.setMaxLogLines(3);
        sut.errors = [
          'Error Info',
          'line 1',
          'line 2',
          'line 3',
          'line 4',
          'line 5'
        ];

        sut.toString();

        ok(clcFake.black.bgRed.calledTwice);
        ok(clcFake.black.bgRed.getCall(0).calledWithExactly('line 1'));
        ok(clcFake.black.bgRed.getCall(1).calledWithExactly('line 2'));
        expect(clcFake.black.bgRed.getCall(2)).to.be.null;
      });

      it('should not error out when there are no errors', function() {
        dt.setMaxLogLines(3);
        sut.errors = [];

        sut.toString();

        expect(clcFake.black.bgRed.getCall(0)).to.be.null;
      });
    });

    describe('setLinesToExclude()', function() {
      it('should change removeTheseLines', function() {
        dt.setLinesToExclude(['world','def']);
        sut.errors = [
          'Error Info',
          'hello world',
          'abc123def456',
          'some string'
        ];
        sut.toString();

        ok(clcFake.black.bgRed.calledOnce);
        ok(clcFake.black.bgRed.getCall(0).calledWithExactly('some string'));
        expect(clcFake.black.bgRed.getCall(1)).to.be.null;
      });
    });

    describe('removeTail()', function() {
      it('should removeTail', function() {
        dt.removeTail();
        sut.errors = [
          'Error Info',
          'some stuff',
          'hello world <- clakjdflsakjflsdjf',
          'abc <- 34',
          '123',
          'def <-ppkf:slfkjdlfksj',
        ];
        sut.toString();
        ok(clcFake.black.bgRed.getCall(0).calledWithExactly('some stuff'));
        ok(clcFake.black.bgRed.getCall(1).calledWithExactly('hello world '));
        ok(clcFake.black.bgRed.getCall(2).calledWithExactly('abc '));
        ok(clcFake.black.bgRed.getCall(3).calledWithExactly('123'));
        ok(clcFake.black.bgRed.getCall(4).calledWithExactly('def '));
        expect(clcFake.black.bgRed.getCall(5)).to.be.null;
      });
    });

    describe('setFileTypeToUnderline()', function() {
      it('should underline the file', function() {
        dt.setFileTypeToUnderline('.spec.ts');
        sut.errors = [
          'Error Info',
          'blah blah in /lol/stuff/myComponent.spec.ts blah blah',
          'askdfjl ksdfj lsdkfj slkjflksdj',
          'sldkfjsldkfj sldkfj sldkfj sldkjfl',
          'blah blah in /lol/stuff/someOtherFile.spec.js blah blah',
          'blah blah in /lol/stuff/someOtherFile.test.ts blah blah'
        ];
        sut.toString();
        // fix this
        // ok(sut.colorUnderline.calledOnce);
      });
    });

    describe('hideBrowser()', function() {
      it('should hide the browser information', function() {
        dt.hideBrowser();
        sut.toString();
        // fix this
        // expect depth to be depth - 1
      });
    });

    describe('errorFormatMethod tests', function() {
      describe('default behavior', function() {
        it('should trim the garbage off of the errors', function() {
          sut.errors = [
            'Error Info',
            'some/file.js?abcdef:123 ',
            'another/file.js?oifdso:345:23 '
          ];

          sut.toString();

          ok(clcFake.black.bgRed.calledTwice);
          ok(clcFake.black.bgRed.getCall(0).calledWithExactly('some/file.js:123'));
          ok(clcFake.black.bgRed.getCall(1).calledWithExactly('another/file.js:345:23'));
        });
      });

      describe('setErrorFormatterMethod', function() {
        it('should override the default errorFormatterMethod', function() {
          sut.errors = [
            'Error Info',
            'error1',
            'error2'
          ];

          var alternateFormatMethod = function(error) {
            return 'Bob Dole ' + error;
          };

          dt.setErrorFormatterMethod(alternateFormatMethod);
          sut.toString();

          ok(clcFake.black.bgRed.calledTwice);
          ok(clcFake.black.bgRed.getCall(0).calledWithExactly('Bob Dole error1'));
          ok(clcFake.black.bgRed.getCall(1).calledWithExactly('Bob Dole error2'));
        });
      });
    });
  });

});
