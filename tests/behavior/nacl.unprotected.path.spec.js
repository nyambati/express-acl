'use strict';
let assert = require('assert');
let acl = require('../../');
let httpMocks = require('node-mocks-http');
let success = {
  status: 200,
  success: true,
  message: 'ACCESS GRANTED'
};

describe('Testing for ubprotected routes', function() {
  let req, res, next, data;

  context('When the routes is not authenticated', function() {
    beforeEach(function(done) {
      acl.config({
        baseUrl: 'api'
      });

      res = httpMocks.createResponse();
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/oranges'
      });
      next = function() {
        res.send(success);
      };
      done();
    });

    it('Should give access to unprotected path', function(done) {
      req.decoded = {};
      req.session = {};
      req.decoded.role = 'user';
      acl.authorize.unless({ path: ['/api/oranges'] })(req, res, next);
      data = res._getData();
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, success);
      done();
    });

  });

});
