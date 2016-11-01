'use strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');

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

describe('Testing for resource scenarios', function() {
  let req, res, next, data;
  context('When action deny', function() {
    beforeEach(function(done) {
      acl.config({
        baseUrl: 'api',
        filename: 'resource-glob-deny.json',
        path: './tests/config'
      });

      res = httpMocks.createResponse();
      next = function() {
        res.send(response.success);
      };

      done();
    });

    it('Should deny access to resource /api/mangoes/42', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/mangoes/42'
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


    it('Should deny access to resource /api/mangoes/42', function(done) {
      req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/mangoes/42'
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

    it('Should allow access to resource /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'DElETE',
        url: '/api/mangoes/42'
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

  context('When action allow', function() {
    beforeEach(function(done) {
      acl.config({
        baseUrl: 'api',
        filename: 'resource-glob-allow.json',
        path: './tests/config'
      });
      done();
    });

    it('Should allow access to resource /api/mangoes/42', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/mangoes/42'
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


    it('Should allow access to resource /api/mangoes/42', function(done) {
      req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/mangoes/42'
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
        url: '/api/mangoes/42'
      });

      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert.deepEqual(data, response.restricted);
      done();
    });
  });
});
