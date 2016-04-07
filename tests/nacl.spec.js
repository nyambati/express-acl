var assert = require('assert');
var expect = require('chai').expect;
var acl = require('../');

describe('Express Access Control List Module', function() {
  describe('Loading the config file (config.json', function() {
    it('should load the config.json when acl.config is called  with path', function() {
      var rules = acl.config({
        path: './tests/config.json',
        encoding: 'UTF-8'
      }).rules;
      assert(Array.isArray(rules), true);
      expect(rules.length).to.be.above(1);
    });

    it('Should load the config.json from the root folder', function() {
      var rules = acl.config().rules;
      assert(Array.isArray(rules), true);
      expect(rules.length).to.equal(1);
    });

    it('Log error when no policy is defined', function() {
      var rules = acl.config({
        path: './tests/empty-policy.json'
      }).rule;

      assert(typeof rules, 'string');
      expect(rules).to.equal(undefined);

    });
  });

});
