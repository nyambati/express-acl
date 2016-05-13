(function() {
  'use strict';

  var expect = require('chai').expect;
  var helper = require('../../lib/helpers');
  var httpMocks = require('node-mocks-http');

  describe('Helpers test', function() {
    context('getRules', function() {
      var path;
      var rules;

      beforeEach(function() {
        path = './tests/config/config.json';
      });

      it('Should return an array containing the rules', function() {
        rules = helper.getRules(path, null, false);

        expect(rules).to.not.be.empty;
        expect(Array.isArray(rules)).to.be.true;
        expect(rules[0]).to.have.property('group');
        expect(rules[0]).to.have.property('permissions');
      });

      it('Should throw an error', function() {
        try {
          rules = helper.getRules(path, 1, true);
        } catch (err) {
          expect(helper.getRules).to.throw(Error);
        }
      });
    });

    context('getGroup', function() {
      var res;
      var mockRole;
      var mockRules;
      var group;
      var error;

      beforeEach(function(done) {
        mockRules = [{
          group: 'admin',
          permissions: [{
            resource: '*',
            methods: '*',
            action: 'allow'
          }]
        }];

        error = {
          message: 'REQUIRED: Group not found'
        };

        res = httpMocks.createResponse(httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        }));

        done();
      });

      it('Should return a group for a specific rule', function() {
        mockRole = 'admin';
        group = helper.getGroup(res, mockRules, mockRole);

        expect(group).to.not.be.empty;
        expect(group.group).to.equal(mockRole);
      });

      it('Should return a 404 status', function(done) {
        mockRole = 'user';
        group = helper.getGroup(res, mockRules, mockRole);
        var data = res._getData();

        expect(res.statusCode).to.equal(404);
        expect(data.message).to.equal(error.message);
        done();
      });
    });

    context('getPolicy', function() {
      var mockResource;
      var mockGroup;

      beforeEach(function() {
        mockResource = 'users';
        mockGroup = {
          group: 'admin',
          permissions: [{
            resource: 'users',
            methods: '*',
            action: 'allow'
          }]
        };
      });

      it('Should return the permissions specified', function() {
        var policy = helper.getPolicy(mockGroup, mockResource);

        expect(policy).to.not.be.empty;
        expect(policy).to.have.property('methods');
        expect(policy).to.have.property('action');
      });
    });
  });
})();