'use strict';
const assert = require('assert');
const acl = require('../../');

let rulesArr = [{
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
  let rules;
  beforeEach(function(done) {
    rules = acl.config({
      rules: rulesArr
    });
    done();
  });

  it('should can direct setted config rules by Array', function() {
    assert(rules.has('user'), true);
    assert(typeof rules, 'object');
    assert.deepEqual(rules.get('user'), rulesArr[0].permissions);
  });
});
