(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../');

  describe('Yaml testing', function() {
    var rules;
    beforeEach(function(done) {
      rules = acl.config({
        path: 'tests/config',
        filename: 'nacl.yml',
        baseUrl: 'api',
        yml: true
      });
      done();
    });

    it('should read the yaml file and convert to json', function() {
      var group = rules[0];

      assert(rules, true);
      assert(typeof rules, 'object');
      assert(rules.length, 1);
      assert.deepEqual(group.group, 'user');
      assert(Array.isArray(group.permissions), true);

      var policy = group.permissions[0];

      assert(policy.resource, true);
      assert.deepEqual(policy.resource, 'users');
      assert(Array.isArray(policy.methods), true);
      assert(policy.methods, true);
      assert.deepEqual(policy.methods.indexOf('GET'), 0);
      assert.deepEqual(policy.methods.indexOf('POST'), 1);
      assert.deepEqual(policy.methods.indexOf('DELETE'), 2);
      assert(policy.action, true);
      assert.deepEqual(policy.action, 'allow');

    });
  });
})();
