(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../');
  var httpMocks = require('node-mocks-http');

  describe('Acl middleware for express', function() {
    var req, res, next, data;

    describe('Policy based on action: "deny and methods glob "*"', function() {
      beforeEach(function(done) {
        acl.config({
          baseUrl: 'api'
        });
        done();
      });

      it('should give access to unprotected path', function(done) {
        req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/oranges'
        });

        res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
        });

        req.decoded = {};
        req.session = {};

        req.decoded.role = 'user';

        next = function() {
          res.send({
            status: 200,
            success: true,
            message: 'ACCESS GRANTED'
          });
        };

        acl
          .authorize
          .unless({
            path: [
              '/api/oranges'
            ]
          })(req, res, next);

        data = res._getData();

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data.status, 200);
        assert.deepEqual(data.success, true);
        assert.deepEqual(data.message, 'ACCESS GRANTED');

        done();
      });

    });

  });

})();
