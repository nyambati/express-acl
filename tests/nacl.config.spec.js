var assert = require('assert');
var acl = require('../');

describe('Express Access Control List Module', function() {
  /**
   * [Load config file]
   * @param  {[json]} )
   * This tests check whether the modules loads the config file, and gives all the neccesary warnings when neccesary
   */
  describe('Loading the config file (config.json', function() {
    it('should load the config.json when acl.config is called  with path', function() {
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

    it('should add the rules to the "opt" object', function() {
      acl.config();
      var data = acl.getRules();
      assert(Array.isArray(data), true);
      assert(data.length, 1);
    });

  });

});
