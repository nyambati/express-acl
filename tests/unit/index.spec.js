'use strict';
const expect = require('chai').expect;
const assert = require('assert');
const acl = require('../../');

describe('Express acl export', function() {
  context('Check if they exist', function() {
    it('All method should be defined', function(done) {
      assert(acl, true);
      assert(acl.config, true);
      assert(acl.authorize, true);
      assert(acl.authorize.unless, true);
      done();
    });
  });

  context('Check for the type', function() {
    it('All properties should be functions', function(done) {
      expect(acl).to.be.an('object');
      expect(acl.config).to.be.a('function');
      expect(acl.authorize).to.be.a('function');
      expect(acl.authorize.unless).to.be.a('function');
      done();
    });
  });
});
