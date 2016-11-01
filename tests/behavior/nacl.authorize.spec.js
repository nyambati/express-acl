(function() {
  'use strict';
  var assert = require('assert');
  var acl = require('../../');
  var httpMocks = require('node-mocks-http');

  describe('Authorize middleware', function() {
    var req, res, data, next;
    var response = {
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

    beforeEach(function(done) {
      res = httpMocks.createResponse();
      next = function() {
        res.send({
          status: 200,
          success: true,
          message: 'ACCESS GRANTED'
        });
      };
      done();
    });

    context('When request comes from home route', function() {
      beforeEach(function(done) {
        acl.config();
        req = httpMocks.createRequest({
          method: 'GET',
          url: '/'
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
        acl.config({ baseUrl: 'api' });
        req = httpMocks.createRequest({
          method: 'GET',
          url: '/api/users/42'
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

    describe('Testing Access With roles', function() {

      context('When role is not defined in the user object', function() {
        it('should block traffic if no role is defined', function(done) {
          req.decoded = {};
          acl.authorize(req, res, next);
          var expectedResponse = {
            status: 'Access denied',
            success: false,
            message: 'REQUIRED: Role not found'
          };

          data = res._getData();

          assert(data, true);
          assert.deepEqual(data, expectedResponse);
          done();
        });
      });

      context('When no policy is defined for such role', function() {
        it('should deny access if no policy for such role', function(done) {
          req.decoded.role = 'guest';
          acl.authorize(req, res, next);
          var expectedResponse = {
            status: 'Access denied',
            success: false,
            message: 'REQUIRED: Group not found'
          };

          data = res._getData();
          assert(data, true);
          assert.deepEqual(data, expectedResponse);
          done();
        });
      });

      context('When action is allow ', function() {
        beforeEach(function(done) {
          acl.config({ baseUrl: 'api' });
          done();
        });

        it('Should allow access to /api/user/42', function(done) {
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

        it('Should allow access to resource  /api/user/42', function(done) {
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

        it('Should deny access to resource /api/user/42', function(done) {
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


      context('When action deny', function() {
        beforeEach(function(done) {
          acl.config({
            baseUrl: 'api',
            filename: 'deny-user-config.json',
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

        it('Should allow access to resource /api/user/42', function(done) {
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
          assert.deepEqual(data, response.success);
          done();
        });

      });

      context('When not policy is defined', function() {

        beforeEach(function(done) {
          acl.config({
            baseUrl: 'api'
          });
          done();
        });

        it('should deny if not policy match resource', function(done) {
          req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/cargo/42'
          });

          req.decoded = {};
          req.session = {};
          req.decoded.role = 'user';
          acl.authorize(req, res, next);
          data = res._getData();
          var expectedResponse = {
            status: 'Access denied',
            success: false,
            message: 'REQUIRED: Policy not found'
          };
          assert(data, true);
          assert.deepEqual(data, expectedResponse);
          done();

        });
      });
    });
  });
})();
