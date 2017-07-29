(function() {
  'use strict';
  var NyanCat = require('./lib/nyanCat').NyanCat;

  NyanCat.$inject = ['baseReporterDecorator', 'formatError', 'config'];

  module.exports = {
    'reporter:helpful': ['type', NyanCat]
  };

})();
