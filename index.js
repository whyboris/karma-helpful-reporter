(function() {
  'use strict';
  var Helpful = require('./lib/helpful').Helpful;

  Helpful.$inject = ['baseReporterDecorator', 'formatError', 'config'];

  module.exports = {
    'reporter:helpful': ['type', Helpful]
  };

})();
