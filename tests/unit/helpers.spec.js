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
      var mockRules;

      beforeEach(function(done) {
        mockRules = [{
          group: 'admin',
          permissions: [{
            resource: '*',
            methods: '*',
            action: 'allow'
          }]
        }];

        res = httpMocks.createResponse(httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        }));

        done();
      });

      it('Should return a group for a specific rule', function() {
        var mockRole = 'admin';
        var group = helper.getGroup(res, mockRules, mockRole);

        expect(group).to.not.be.empty;
        expect(group.group).to.equal(mockRole);
      });

      it('Should return a 404 status', function(done) {
        var error = {
          message: 'REQUIRED: Group not found'
        };
        var mockRole = 'user';
        var group = helper.getGroup(res, mockRules, mockRole);
        var data = res._getData();

        expect(res.statusCode).to.equal(404);
        expect(data.message).to.equal(error.message);
        done();
      });
    });

    context('getPolicy', function() {
      it('Should return the permissions specified', function() {
        var mockResource = 'users';
        var mockGroup = {
          group: 'admin',
          permissions: [{
            resource: 'users',
            methods: '*',
            action: 'allow'
          }]
        };
        var policy = helper.getPolicy(mockGroup, mockResource);

        expect(policy).to.not.be.empty;
        expect(policy).to.have.property('methods');
        expect(policy).to.have.property('action');
      });
    });

    context('getRole', function() {
      var res;

      beforeEach(function(done) {
        res = httpMocks.createResponse(httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        }));
        done();
      });

      it('Should return the role', function() {
        var session = {};
        var decoded = {
          role: 'user'
        };
        var role = helper.getRole(res, decoded, session);

        expect(role).to.not.be.empty;
        expect(role).to.equal(decoded.role);
      });

      it('Should return the role when session exits and decoded is empty', function() {
        var session = {
          role: 'admin'
        };
        var decoded = {};
        var role = helper.getRole(res, decoded, session);

        expect(role).to.not.be.empty;
        expect(role).to.equal(session.role);
      });

      it('Should respond with 404', function() {
        var error = {
          message: 'REQUIRED: Role not found'
        };
        var session = {};
        var decoded = {};
        var role = helper.getRole(res, decoded, session);
        var data = res._getData();

        expect(res.statusCode).to.equal(404);
        expect(data.message).to.equal(error.message);
      });
    });
  });
})();