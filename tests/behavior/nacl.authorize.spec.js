'use strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');

describe('Authorize middleware', function() {
  let req, res, data, next;
  let response = {
    success: {
      status: 200,
      success: true,
      message: 'ACCESS GRANTED',
    },
    restricted: {
      status: 'Access denied',
      success: false,
      message: 'Unauthorized access',
    },
  };

  beforeEach(function(done) {
    res = httpMocks.createResponse();
    acl.config({
      baseUrl: 'api',
      filename: 'nacl.json',
      path: '.',
    });
    next = function() {
      return res.send({
        status: 200,
        success: true,
        message: 'ACCESS GRANTED',
      });
    };
    done();
  });

  context('When request comes from home route', function() {
    beforeEach(function(done) {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/',
      });
      req.decoded = {};
      req.session = {};
      done();
    });

    it('should allow traffic for the home route', function(done) {
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When role is defined in the user object', function() {
    beforeEach(function(done) {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      done();
    });

    it('should allow when role is defined on /api/user/42', function(done) {
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When role is not defined in the user object', function() {
    it('should block traffic if no role is defined', function(done) {
      req.decoded = {};
      res = httpMocks.createResponse();
      acl.authorize(req, res, next);
      let expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'REQUIRED: Policy for role guest is not defined',
      };

      data = JSON.parse(res._getData());

      assert(data, true);
      assert.deepEqual(data, expectedResponse);
      done();
    });
  });

  context('When no policy is defined for such role', function() {
    it('should deny access if no policy for such role', function(done) {
      req.decoded.role = 'guest';
      res = httpMocks.createResponse();
      acl.authorize(req, res, next);
      let expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'REQUIRED: Policy for role guest is not defined',
      };

      data = JSON.parse(res._getData());
      assert(data, true);
      assert.deepEqual(data, expectedResponse);
      done();
    });
  });

  context('When action is allow ', function() {
    beforeEach(function(done) {
      res = httpMocks.createResponse();
      done();
    });

    it('Should allow access to /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });

    it('Should allow access to resource  /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });

    it('Should deny access to resource /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'DElETE',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.config({
        baseUrl: 'api',
      });
      acl.authorize(req, res, next);
      data = JSON.parse(res._getData());

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });
  });

  context('When action deny', function() {
    beforeEach(function(done) {
      acl.config({
        baseUrl: 'api',
        filename: 'deny-user-config.json',
        path: './tests/config',
      });
      done();
    });

    it('Should deny access to resource /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = JSON.parse(res._getData());

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });

    it('Should deny access to resource /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = JSON.parse(res._getData());

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);

      done();
    });

    it('Should allow access to resource /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'DElETE',
        url: '/api/users/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();

      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When not policy is defined', function() {
    beforeEach(function(done) {
      acl.config({baseUrl: 'api'});
      res = httpMocks.createResponse();
      done();
    });

    it('should deny if not policy match resource', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/cargo/42',
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);

      data = JSON.parse(res._getData());
      assert(data, true);
      assert.deepEqual(data, response.restricted);
      done();
    });
  });
});
