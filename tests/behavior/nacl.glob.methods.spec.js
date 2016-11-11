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

describe('Testing Methods', function() {
  let req, res, data, next;
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
        filename: 'methods-glob-deny.json',
        path: './tests/config'
      });
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


    it('Should deny access to resource/api/mangoes/42', function(done) {
      req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/mangoes/42'
      });
      req.decoded = {};
      req.session = {};
      req.session.role = 'user';
      acl.authorize(req, res, next);
      data = res._getData();
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });

    it('Should deny access to resource /api/mangoes/42', function(done) {
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

  context('When action allow', function() {
    beforeEach(function(done) {
      acl.config({
        baseUrl: 'api',
        filename: 'methods-glob-allow.json',
        path: './tests/config'
      });
      done();
    });

    it('Should allow traffic to resources /api/mangoes/42', function(done) {
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


    it('Should allow traffic to resources /api/mangoes/42', function(done) {
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

    it('Should allow traffic to resources /api/user/42', function(done) {
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

});
