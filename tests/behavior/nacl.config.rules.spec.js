(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../../');

  //
  var rulesArr = [{
    group: 'user',
    permissions: [{
      resource: 'users',
      methods: [
	'GET',
	'POST',
	'DELETE'
      ],
      action: 'allow'
    }]
  }];

  describe('Array testing', function() {
    var rules;
    beforeEach(function(done) {
      rules = acl.config({
	rules: rulesArr
      });
      done();
    });

    it('should can direct setted config rules by Array', function() {
      var expectedRule = [{
        group: 'user',
        permissions: [{
          resource: 'users',
          methods: ['GET', 'POST', 'DELETE'],
          action: 'allow'
        }]
      }];
      assert(rules, true);
      assert(typeof rules, 'object');
      assert(rules.length, 1);
      assert.deepEqual(rules, expectedRule);

    });
  });
})();
