'use strict';
const assert = require('assert');
const acl = require('../../');

describe('Yaml testing', function() {
  let rules;
  beforeEach(function(done) {
    rules = acl.config({
      path: 'tests/config',
      baseUrl: 'api',
      yml: true
    });
    done();
  });

  it('should read the yaml file and convert to json', function() {
    let expectedRule = [{
      resource: 'users',
      methods: ['GET', 'POST', 'DELETE'],
      action: 'allow'
    }];

    assert(rules, true);
    assert(rules.has('user'));
    assert.deepEqual(rules.get('user'), expectedRule);

  });
});
