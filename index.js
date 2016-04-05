/**
 *  nacl
 *  copyright(c) 2016 - 2019 Thomas Nyambati
 *  MIT Lincensed
 */

(function() {
  'use strict';
  var helper = require('./lib');
  var rules;
  var policy;

  module.exports = {
    config: function(options) {
      var path, encoding;

      if (options) {
        path = options.path;
        encoding = options.encoding;
      }

      rules = helper.readJson();
    },

    proctect: function() {
      var role = req.session.role || req.decoded.role || 'guest';

    }

  };
})();
