'use strict';
const chai = require('chai');
const helper = require('../../lib/helpers');
const httpMocks = require('node-mocks-http');
const spies = require('chai-spies');
const expect = chai.expect;

describe('Helpers test', function() {

  context('getRules', function() {
    let path, rules;

    beforeEach(function() {
      path = './tests/config/config.json';
    });

    it('Should return an array containing the rules', function() {
      rules = helper.getRules(path, null, false);
      let permissions = rules.get('user');
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
      let mockResource = 'users';
      let mockGroup = [{
        resource: 'users',
        methods: '*',
        action: 'allow'
      }];

      let policy = helper.getPolicy(mockGroup, mockResource);

      expect(policy).to.not.be.empty;
      expect(policy).to.have.property('methods');
      expect(policy).to.have.property('action');
    });
  });

  context('getRole', function() {
    let res;

    beforeEach(function(done) {
      res = httpMocks.createResponse();
      done();
    });

    it('Should return the role', function() {
      let session = {};
      let decoded = {
        role: 'user'
      };
      let role = helper.getRole(res, decoded, session);

      expect(role).to.not.be.empty;
      expect(role).to.equal(decoded.role);
    });

    it('Should return the role when session exits', function() {
      let session = {
        role: 'admin'
      };
      let decoded = {};
      let role = helper.getRole(res, decoded, session);

      expect(role).to.not.be.empty;
      expect(role).to.equal(session.role);
    });

    it('Should respond with 404', function() {
      let error = {
        message: 'REQUIRED: Role not found'
      };
      let session = {};
      let decoded = {};
      let role = helper.getRole(res, decoded, session);
      let data = res._getData();

      expect(role).to.be.empty;
      expect(res.statusCode).to.equal(404);
      expect(data.message).to.equal(error.message);
    });
  });

  context('resource', function() {
    let next;

    beforeEach(function() {
      next = function() {
        return;
      };
    });

    it('Should return the resource for a given url', function() {
      let url = '/api/user/4';
      let baseUrl = 'api';
      let resource = helper.resource(next, url, baseUrl);

      expect(resource).to.not.be.empty;
      expect(resource).to.equal('user');
    });

    it('Should call next', function() {
      chai.use(spies);
      let url = '';
      let baseUrl = 'api';
      let spy = chai.spy(next);
      let resource = helper.resource(spy, url, baseUrl);

      expect(resource).to.be.empty;
      expect(spy).to.have.been.called();
    });
  });
});
