var assert = require('assert');
var acl = require('../');
var httpMocks = require('node-mocks-http');

describe('Acl middleware for express', function() {
  var req, res, next;
  /**
   * Test if it denies traffic,  when roles are not defined
   */

  describe('Roles', function() {

    beforeEach(function(done) {
      acl.config();

      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/42',
        params: {
          id: 42
        }
      });

      res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });

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
      acl.authorize(req, res, done);
      var data = res._getData();
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data.status, 403);
      assert.deepEqual(data.success, false);
      assert.deepEqual(data.error, 'ACCESS DENIED');
      done();
    });

    it('should allow traffic for the user when role is defined on /api/user/42', function(done) {
      next = function() {
        res.send({
          status: 200,
          success: true,
          message: 'ACCESS GRANTED'
        });
      };
      req.decoded.role = 'user';
      /**
       * Ensure that the allowed is false;
       */

      assert(typeof next, 'function');

      acl.authorize(req, res, next);
      /**
       * when traffic is allowed it next method will be called and changed allowed to true
       *
       */
      var data = res._getData();
      assert(data, true);
      assert.deepEqual(data.status, 200);
      assert.deepEqual(data.success, true);
      assert.deepEqual(data.message, 'ACCESS GRANTED');

      done();
    });
  });

  /**
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
  describe('Policy traffic restriction testing based on action "allow"', function() {
    beforeEach(function(done) {
      acl.config();
      done();
    });

    it('should allow POST operation on /api/user/42', function(done) {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/42',
        params: {
          id: 42
        }
      });

      res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });

      req.decoded = {};
      req.session = {};
      res.allowed = false;

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
        url: '/api/users/42',
        params: {
          id: 42
        }
      });

      res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });

      req.decoded = {};
      req.session = {};
      res.allowed = false;

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
        url: '/api/users/42',
        params: {
          id: 42
        }
      });

      res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });

      req.decoded = {};
      req.session = {};
      res.allowed = false;

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

});
