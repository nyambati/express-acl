(function() {
  'use strict';

  var chai = require('chai'),
    helper = require('../../lib/helpers'),
    httpMocks = require('node-mocks-http'),
    spies = require('chai-spies');

  describe('Helpers test', function() {
    var expect;

    beforeEach(function() {
      expect = chai.expect;
    });

    context('getRules', function() {
      var path;
      var rules;

      beforeEach(function() {
        path = './tests/config/config.json';
      });

      it('Should return an array containing the rules', function() {
        rules = helper.getRules(path, null, false);
        var permissions = rules.get('user');
        expect(rules.has('user')).to.equal(true);
        expect(permissions[0]).to.have.property('resource');
        expect(permissions[0]).to.have.property('methods');
        expect(permissions[0]).to.have.property('action');
      });

      it('Should throw an error', function() {
        try {
          rules = helper.getRules(path, 1, true);
        } catch (err) {
          expect(helper.getRules).to.throw(Error);
        }
      });
    });


    context('getPolicy', function() {
      it('Should return the permissions specified', function() {
        var mockResource = 'users';
        var mockGroup = [{
          resource: 'users',
          methods: '*',
          action: 'allow'
        }];

        var policy = helper.getPolicy(mockGroup, mockResource);

        expect(policy).to.not.be.empty;
        expect(policy).to.have.property('methods');
        expect(policy).to.have.property('action');
      });
    });

    context('getRole', function() {
      var res;

      beforeEach(function(done) {
        res = httpMocks.createResponse();
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

      it('Should return the role when session exits', function() {
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

        expect(role).to.be.empty;
        expect(res.statusCode).to.equal(404);
        expect(data.message).to.equal(error.message);
      });
    });

    context('resource', function() {
      var next;

      beforeEach(function() {
        next = function() {
          return;
        };
      });

      it('Should return the resource for a given url', function() {
        var url = '/api/user/4';
        var baseUrl = 'api';
        var resource = helper.resource(next, url, baseUrl);

        expect(resource).to.not.be.empty;
        expect(resource).to.equal('user');
      });

      it('Should call next', function() {
        chai.use(spies);
        var url = '';
        var baseUrl = 'api';
        var spy = chai.spy(next);
        var resource = helper.resource(spy, url, baseUrl);

        expect(resource).to.be.empty;
        expect(spy).to.have.been.called();
      });
    });
  });
})();
