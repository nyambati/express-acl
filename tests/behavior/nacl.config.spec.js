'use strict';
const assert = require('assert');
const acl = require('../../');
const helper = require('../../lib/helpers');

describe('Acl configuration file', function() {
  let res, rules;
  context('When path is specified', function() {
    it('Should return a map of the ACL rules', function() {
      rules = acl.config({
        filename: 'config/config.json',
        path: 'tests'
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
      res = '\u001b[33mPolicy not set, All traffic will be denied\u001b[39m';
      rules = acl.config({
        path: './tests/config',
        filename: 'empty-policy.json'
      });
      assert(typeof rules, 'string');
      assert.deepEqual(rules, res);
    });
  });


  context('When no baseUrl is defined', function() {
    it('Should be able to locate the location of the resource', function() {
      let url = '/users/45gg4hht6';
      let next = function() {
        return true;
      };
      let resource = helper.resource(next, url);
      assert.deepEqual(resource, 'users');
    });

  });

  context('When the baseUrl is defined', function() {
    it('Should be able to locate the location of the resource', function() {
      let url = 'developer/v1/users/45gg4hht6';
      let next = function() {
        return true;
      };
      let config = {
        baseUrl: 'developer/v1/'
      };
      let resource = helper.resource(next, url, config.baseUrl);
      assert.deepEqual(resource, 'users');
    });
  });

});
