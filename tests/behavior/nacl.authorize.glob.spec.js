'use strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');

describe('Acl middleware for express', function() {
  let req, res, next, data;
  let response = {
    success: {
      status: 200,
      success: true,
      message: 'ACCESS GRANTED'
    },
    restricted: {
      status: 'Access denied',
      success: false,
      message: 'Unauthorized access'
    }
  };

  describe('When the methods and resource is a glob', function() {
    beforeEach(function(done) {
      res = httpMocks.createResponse();
      next = function() {
        res.send(response.success);
      };
      done();
    });

    context('When action deny', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-deny.json',
          path: './tests/config'
        });
        done();
      });

      it('Should deny access to resource /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42'
        });

        req.decoded = {};
        req.session = {};
        req.decoded.role = 'user';
        acl.authorize(req, res, next);
        data = res._getData();
        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data, response.restricted);
        done();
      });


      it('Should deny access to resource /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/users/42'
        });

        req.decoded = {};
        req.session = {};
        req.decoded.role = 'user';
        acl.authorize(req, res, next);
        data = res._getData();
        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data, response.restricted);
        done();

      });

      it('Should deny access to resource on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/users/42'
        });

        req.decoded = {};
        req.session = {};
        req.decoded.role = 'user';
        acl.authorize(req, res, next);
        data = res._getData();
        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data, response.restricted);
        done();
      });
    });

    context('When action allow', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-allow.json',
          path: './tests/config'
        });
        done();
      });

      it('Should Deny Access to resource /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42'
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
          method: 'PUT',
          url: '/api/users/42'
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

      it('should deny DElETE operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/users/42'
        });

        req.decoded = {};
        req.session = {};
        req.decoded.role = 'user';
        acl.authorize(req, res, next);
        data = res._getData();
        assert(data, true);
        assert(data, true);
        assert.deepEqual(data, response.success);
        done();
      });
    });
  });
});
