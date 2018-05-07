const acl = require('../../');
const assert = require('assert');
const http = require('node-mocks-http');

let res, next;
describe('Test Sub Routes configurration', () => {
  beforeEach(done => {
    res = http.createResponse();
    next = () => {
      return {
        message: 'ACCESS GRANTED'
      };
    };

    acl.config({
      path: 'tests/config',
      baseUrl: 'api',
      filename: 'subroutes.json'
    });
    done();
  });

  context('When subroutes are spefied', () => {
    it('Should allow traffic or deny traffic when passed url of api/users/45', done => {
      const req = http.createRequest({
        method: 'GET',
        url: '/api/users/45'
      });

      req.decoded = {
        role: 'user'
      };

      acl.authorize(req, res, next);

      const data = JSON.parse(res._getData());

      assert.deepEqual(data, {
        status: 'Access denied',
        success: false,
        message: 'Unauthorized access'
      });

      done();
    });

    it('Should allow traffic for api/users/public', done => {
      const req = http.createRequest({
        method: 'GET',
        url: '/api/users/public'
      });

      req.decoded = {
        role: 'user'
      };

      const data = acl.authorize(req, res, next);
      assert.deepEqual(data, next());
      done();
    });

    it('Should allow traffic for api/users/public when query string is added', done => {
      const req = http.createRequest({
        method: 'GET',
        url: '/api/users/public?string=true'
      });

      req.decoded = { role: 'user' };

      const data = acl.authorize(req, res, next);
      assert.deepEqual(data, next());
      done();
    });
  });
});
