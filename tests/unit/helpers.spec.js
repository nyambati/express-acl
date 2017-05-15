'use strict';
const chai = require('chai');
const helper = require('../../lib/helpers');
const httpMocks = require('node-mocks-http');
const spies = require('chai-spies');
const expect = chai.expect;

describe('Helpers test', function () {

  context('getRules', function () {
    let path, rules;

    beforeEach(function () {
      path = './tests/config/config.json';
    });

    it('Should return an array containing the rules', function () {
      rules = helper.getRules(path, null, false);
      let permissions = rules.get('user');
      expect(rules.has('user')).to.equal(true);
      expect(permissions[0]).to.have.property('resource');
      expect(permissions[0]).to.have.property('methods');
      expect(permissions[0]).to.have.property('action');
    });

    it('Should throw an error', function () {
      try {
        rules = helper.getRules(path, 1, true);
      } catch (err) {
        expect(helper.getRules).to.throw(Error);
      }
    });
  });


  context('getPolicy', function () {
    it('Should return the permissions specified', function () {
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
    let req;
    let res;

    beforeEach(function(done) {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
      done();
    });

    it('Should return the role', function() {
      req.decoded = {
        role: 'user'
      };
      let role = helper.getRole(req, res);
      expect(role).to.not.be.empty;
      expect(role).to.equal(req.decoded.role);
    });

    it('Should return the role when session exists', function() {
      req.session = {
        role: 'admin'
      };
      let role = helper.getRole(req, res);
      expect(role).to.not.be.empty;
      expect(role).to.equal(req.session.role);
    });

    it('Should return the role when option exists', function() {

      let opt = {
        decodedObjectName: 'decodedObjectName'
      };

      req[opt.decodedObjectName] = {
        role: 'admin'
      };
      let role = helper.getRole(req, res, opt.decodedObjectName);

      expect(role).to.not.be.empty;
      expect(role).to.equal(req[opt.decodedObjectName].role);
    });

    it('Should return default role if user has no role defined', function () {
      let defaultRole = 'guest'
      let role = helper.getRole(req, res, undefined, defaultRole);
      expect(role).not.to.be.empty;
      expect(role).to.eq(defaultRole);
    });
  });

  context('resource', function () {
    let next;

    beforeEach(function () {
      next = function () {
        return;
      };
    });

    it('Should return the resource for a given url', function () {
      let url = '/api/user/4';
      let baseUrl = 'api';
      let resource = helper.resource(next, url, baseUrl);

      expect(resource).to.not.be.empty;
      expect(resource).to.equal('user');
    });

    it('Should call next', function () {
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
