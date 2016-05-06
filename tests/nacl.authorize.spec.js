(function() {
  'use strict';
  var assert = require('assert');
  var acl = require('../');
  var httpMocks = require('node-mocks-http');

  describe('Acl middleware for express', function() {
    var req, res, next;
    /**
     * Home route
     * traffic to this route should always be allowed
     */

    describe('Home route testing', function() {
      beforeEach(function(done) {
        acl.config();

        req = httpMocks.createRequest({
          method: 'GET',
          url: '/'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};
        done();
      });

      it('should allow traffic for the home route', function(done) {
        //{ status: 403, success: false, error: 'ACCESS DENIED' }
        next = function() {
          res.send({
            status: 200,
            success: true,
            message: 'ACCESS GRANTED'
          });
        };

        acl.authorize(req, res, next);
        var data = res._getData();


        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');
        done();
      });

    });

    /**
     * Test if it denies traffic,  when roles are not defined
     */

    describe('Roles', function() {

      beforeEach(function(done) {
        acl.config();

        req = httpMocks.createRequest({
          method: 'GET',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};
        done();
      });

      it('Ensure that authorize middleware is defined', function(done) {
        assert(typeof acl.middleware, 'function');
        done();
      });

      it('should block traffic if no role is defined', function(done) {
        //{ status: 403, success: false, error: 'ACCESS DENIED' }
        acl.authorize(req, res, next);
        var data = res._getData();
        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');
        done();
      });

      it('should allow when role is defined on /api/user/42', function(done) {

        req.decoded.role = 'user';
        /**
         * Ensure that the allowed is false;
         */

        assert(typeof next, 'function');

        acl.authorize(req, res, next);
        /**
         * when traffic is allowed it next method
         *  will be called and changed allowed to true
         *
         */
        var data = res._getData();
        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

      it('should deny access if no policy for such role', function(done) {

        req.decoded.role = 'guest';
        /**
         * Ensure that the allowed is false;
         */

        assert(typeof next, 'function');

        acl.authorize(req, res, next);
        /**
         * when traffic is allowed it next method
         *  will be called and changed allowed to true
         *
         */
        var data = res._getData();
        assert(data, true);
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });
    });

    /**
     * user policy.
     *
     {
      "group": "user",
      "permissions": [{
        "resource": "users",
        "methods": [
          "POST",
          "GET",
          "PUT"
        ]
      }],
      "action": "allow"
     }
     */
    describe('Policy test based on action "allow"', function() {
      beforeEach(function(done) {
        acl.config({ baseUrl: 'api' });
        done();
      });

      it('should allow POST operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: []
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

      it('should allow PUT operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: []
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

      it('should denie DElETE operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: []
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });
    });


    /**
     * Action: "deny"
     * /**
     * user policy.
     *
     {
      "group": "user",
      "permissions": [{
        "resource": "users",
        "methods": [
          "POST",
          "GET",
          "PUT"
        ]
      }],
      "action": "deny"
     }
     */


    describe('Policy testing based on action: "deny', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'deny-user-config.json',
          path: './tests/config'
        });
        done();
      });

      it('should allow POST operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be denied
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });


      it('should allow PUT operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be denied
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });

      it('should denie DElETE operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'DElETE',
          url: '/api/users/42'
        });

        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * {The policy denies traffic on the below methods,
         * but allow traffic to other methods not specified}
         * methods: ["POST","GET","PUT"]
         * action: "allow"
         */

        var data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

    });

    describe('No policy defined', function() {

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
        res = httpMocks.createResponse();

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';


        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: []
         * action: "allow"
         */

        var data = res._getData();
        console.log(data);
        assert(data, true);
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();

      });
    });
  });

})();
