(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../');
  var httpMocks = require('node-mocks-http');

  describe('Acl middleware for express', function() {
    var req, res, next, data;

    /**
     * user policy.
     *
     {
      "group": "user",
      "permissions": [{
        "resource": "*",
        "methods":"*"
      }],
      "action": "deny"
     }
     */

    describe('Policy based on "*" and action: deny', function() {

      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-deny.json',
          path: './tests/config'
        });
        done();
      });

      it('should deny POST operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42',
          params: {
            id: 42
          }
        });

        res = httpMocks.createResponse();

        next = function() {
          res.send({
            status: 200,
            success: true,
            message: 'ACCESS GRANTED'
          });
        };

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        acl.authorize(req, res, next);

        /**
         * Traffic should be allowed
         * methods: []
         * action: "allow"
         */

        data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();
      });


      it('should deny PUT operation on /api/user/42', function(done) {
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

        data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 403);
        assert.deepEqual(data.success, false);
        assert.deepEqual(data.error, 'ACCESS DENIED');

        done();

      });

      it('should deny DElETE operation on /api/user/42', function(done) {
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

        data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
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
          "resource": "*",
          "methods":"*",
          "action": "deny"
        }]
       }
       */

    describe('Policy  based on "*" and action: allow', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-allow.json',
          path: './tests/config'
        });
        done();
      });

      it('should deny POST operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/users/42',
          params: {
            id: 42
          }
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


      it('should deny PUT operation on /api/user/42', function(done) {
        req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/users/42',
          params: {
            id: 42
          }
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

        data = res._getData();

        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

      it('should deny DElETE operation on /api/user/42', function(done) {
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

        data = res._getData();

        assert(data, true);
        assert(data, true);
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });
    });
  });

})();
