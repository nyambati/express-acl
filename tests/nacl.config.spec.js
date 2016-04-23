var assert = require('assert');
var acl = require('../');
var helper = require('../lib/helpers');

describe('Express Access Control List Module', function() {
  /**
   * [Load config file]
   * @param  {[json]} )
   * This tests check whether the modules loads
   * the config file, and gives all the neccesary warnings when neccesary
   */
  describe('Loading the config file (config.json', function() {
    it('should load config jsonfile when path is specifyed', function() {
      var rules = acl.config({
        path: './tests/config.json',
        encoding: 'UTF-8'
      });
      assert(Array.isArray(rules), true);
      assert(rules.length, 1);
    });

    it('Should load the config.json from the root folder', function() {
      var rules = acl.config();
      assert(Array.isArray(rules), true);
      assert(rules.length, 1);
    });

    it('Log error when no policy is defined', function() {
      var rules = acl.config({
        path: './tests/empty-policy.json'
      });

      assert(typeof rules, 'string');
      assert.deepEqual(rules, '\u001b[33mPolicy not set, ' +
        'All traffic will be denied\u001b[39m');

    });

    it('should add the rules to the "opt" object ', function() {
      acl.config();
      var data = acl.getRules();
      assert(Array.isArray(data), true);
      assert(data.length, 1);
    });

  });


  describe('No BaseUrl', function() {
    it('Should be able to locate the location of the resource', function() {

      var url = '/users/45gg4hht6';

      var next = function() {
        return true;
      };

      var resource = helper.resource(next, url);
      assert.deepEqual(resource, 'users');

    });
  });

  describe('With  BaseUrl', function() {
    it('Should be able to locate the location of the resource', function() {

      var url = 'developer/v1/users/45gg4hht6';

      var next = function() {
        return true;
      };
      var config = {
        baseUrl: 'developer/v1/'
      };

      var resource = helper.resource(next, url, config.baseUrl);
      assert.deepEqual(resource, 'users');

    });
  });

});
