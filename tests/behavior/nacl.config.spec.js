'use strict';
const assert = require('assert');
const acl = require('../../');

describe('Acl configuration file', function() {
  let res, rules;
  context('When path is specified', function() {
    it('Should return a map of the ACL rules', function() {
      rules = acl.config({
        filename: 'config/config.json',
        path: 'tests',
      });

      let permissions = rules.get('user');
      assert(rules);
      assert(typeof rules, 'object');
      assert(Array.isArray(permissions), true);
      assert(permissions.length, 1);
    });
  });

  context('When no path is specified', function() {
    it('Should Load the rules from the root folder', function() {
      rules = acl.config();
      let permissions = rules.get('user');
      assert(rules);
      assert(typeof rules, 'object');
      assert(Array.isArray(permissions), true);
      assert(permissions.length, 1);
    });
  });

  context('When no Rules are denied', function() {
    it('Log error when no policy is defined', function() {
      res =
        '\u001b[33mWARNING: You have not set any policies, All traffic will be denied\u001b[39m';
      rules = acl.config({
        path: './tests/config',
        filename: 'empty-policy.json',
      });
      assert(typeof rules, 'string');
      assert.deepEqual(rules, res);
    });
  });
});
