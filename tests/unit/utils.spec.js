'use strict';
const expect = require('chai').expect;
const assert = require('assert');
const httpMocks = require('node-mocks-http');
const utils = require('../../lib/utils');

describe('Testing Utils', function() {
  // mock res
  let res, data, next, method;

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

  let methods = ['GET', 'PUT', 'DELETE'];

  beforeEach(function(done) {
    res = httpMocks.createResponse();

    next = function() {
      res.send(response.success);
    };

    done();
  });

  describe('Validating Utils', function() {

    it('All the function should be defined', function() {
      assert(utils, true);
      assert(utils.deny, true);
      assert(utils.whenGlobAndActionDeny, true);
      assert(utils.whenGlobAndActionAllow, true);
      assert(utils.whenResourceAndMethodGlob, true);
      assert(utils.whenIsArrayMethod, true);
    });

    it('They should be functions', function() {
      expect(utils.deny).to.be.a('function');
      expect(utils.whenGlobAndActionDeny).to.be.a('function');
      expect(utils.whenGlobAndActionAllow).to.be.a('function');
      expect(utils.whenResourceAndMethodGlob).to.be.a('function');
      expect(utils.whenIsArrayMethod).to.be.a('function');
    });

  });

  describe('Utils.deny', function() {

    it('should return default message when called with status', function() {
      utils.deny(res, 403);
      data = res._getData();
      assert(data, true);
      expect(data).to.be.an('object');
      assert.deepEqual(data, response.restricted);
    });

    it('Should return custom message when called with message', function() {
      utils.deny(res, 450, 'Role not found');
      data = res._getData();
      assert(data, true);
      expect(data).to.be.an('object');
      assert.deepEqual(data, {
        status: 'Access denied',
        success: false,
        message: 'Role not found'
      });
    });

    it('should return custom error when called with custom error messages', function() {
      let customErrorResponse = {
        status: 'Access Denied',
        message: 'You are not authorized to access this resource'
      };

      utils.deny(res, 403, null, customErrorResponse);
      data = res._getData();
      assert(data);
      expect(data).to.be.an('object');
      expect(res.statusCode).to.equal(403);
      assert.deepEqual(data, customErrorResponse);
    });

  });

  describe('Utils.whenGlobAndActionAllow', function() {
    context('When the Methods are a string', function() {

      it('should call next when method is string and *', function() {
        utils.whenGlobAndActionAllow(res, next, null, '*');
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.success);
      });

    });

    context('When the methods are an Array', function() {

      it('Should call next if methods is Array and method exist', function() {
        method = 'GET';
        utils.whenGlobAndActionAllow(res, next, method, methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.success);

      });

      it('Should return deny response if method does not exist', function() {
        method = 'PATCH';
        utils.whenGlobAndActionAllow(res, next, method, methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);
      });

    });
  });

  describe('Utils.whenGlobAndActionDeny', function() {

    context('When the Methods are a string', function() {

      it('Should return deny response when called with *', function() {
        utils.whenGlobAndActionDeny(res, null, null, '*', null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);
      });

    });

    context('When the methods are an Array', function() {
      it('Should call next if methods is Array and method exist', function() {
        method = 'GET';
        utils.whenGlobAndActionDeny(res, next, method, methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);

      });

      it('Should return deny response if method does not exist', function() {
        method = 'PATCH';
        utils.whenGlobAndActionDeny(res, next, method, methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.success);
      });
    });

  });


  describe('Utils.whenResourceAndMethodGlob', function() {

    it('Should return next if action allow', function() {
      utils.whenResourceAndMethodGlob(res, next, 'allow', '*');
      data = res._getData();
      assert(data, true);
      expect(data).to.be.an('object');
      assert.deepEqual(data, response.success);
    });

    it('Should return deny response when action deny', function() {
      utils.whenResourceAndMethodGlob(res, next, 'deny', '*', null);
      data = res._getData();
      assert(data, true);
      expect(data).to.be.an('object');
      assert.deepEqual(data, response.restricted);
    });

  });

  describe('Utils.whenIsArrayMethod', function() {
    context('When action allow', function() {

      it('Should call next if method exist', function() {
        utils.whenIsArrayMethod(res, next, 'allow', 'GET', methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.success);
      });

      it('Should return deny response if method doesn\'t exist', function() {
        utils.whenIsArrayMethod(res, next, 'allow', 'PATCH', methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);
      });

    });

    context('When action deny', function() {

      it('Should return deny response if method exist', function() {
        utils.whenIsArrayMethod(res, next, 'deny', 'GET', methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);
      });

      it('Should call next if method doesn\'t exist', function() {
        utils.whenIsArrayMethod(res, next, 'deny', 'PATCH', methods, null);
        data = res._getData();
        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.success);
      });
    });
  });

  describe('Check properties', function() {
    context('When valid rules are passed', function() {
      it('Should assert core properties and return the rules', function() {
        let mockRule = [{
          group: 'user',
          permissions: [{
            resource: 'users',
            methods: [
              'POST',
              'GET',
              'PUT'
            ],
            action: 'deny'
          }]
        }];
        let rules = utils.checkProperties(mockRule);
        let permissions = rules.get('user');
        expect(typeof rules).to.equal('object');
        expect(permissions).to.be.instanceof(Array);
        expect(permissions).to.equal(mockRule[0].permissions);
      });
    });

    context('When invalid methods are passed', function() {
      it('Should assert core properties and return the rules', function() {
        let mockRule = [{
          group: 'user',
          permissions: [{
            resource: 'users',
            methods: {},
            action: 'deny'
          }]
        }];
        try {
          utils.checkProperties(mockRule);
        } catch (error) {
          expect(error.message).to.equal(
            'TypeError: Methods should be a array or string'
          );
        }
      });
    });

    context('When invalid Glob are passed', function() {
      it('Should assert core properties and return the rules', function() {
        let mockRule = [{
          group: 'user',
          permissions: [{
            resource: 'users',
            methods: '&',
            action: 'deny'
          }]
        }];
        try {
          utils.checkProperties(mockRule);
        } catch (error) {
          expect(error.message).to.equal(
            'DefinitionError: Unrecognised glob "&" , use "*" instead'
          );
        }
      });
    });

    context('When invalid action is passed ', function() {
      it('Should assert core properties and return the rules', function() {
        let mockRule = [{
          group: 'user',
          permissions: [{
            resource: 'users',
            methods: '*',
            action: 'what'
          }]
        }];
        try {
          utils.checkProperties(mockRule);
        } catch (error) {
          expect(error.message).to.equal(
            'TypeError: action should be either "deny" or "allow"'
          );
        }
      });
    });
  });

  describe('Validate', function() {
    let rules;

    it('Should return rules once validated', function() {
      let mockRule = [{
        group: 'user',
        permissions: [{
          resource: 'users',
          methods: [
            'POST',
            'GET',
            'PUT'
          ],
          action: 'deny'
        }]
      }];

      rules = utils.validate(mockRule);
      let permissions = rules.get('user');
      expect(typeof rules).to.equal('object');
      expect(permissions).to.be.instanceof(Array);
      expect(permissions).to.equal(mockRule[0].permissions);
    });

    it('Should throw an error when rules is not an array', function() {
      let mockRule = {
        group: 'user'
      };
      try {
        utils.validate(mockRule);
      } catch (error) {
        expect(utils.validate).to.throw(Error);
      }
    });

    it('Should return a message when rules is empty', function() {
      let mockRule = [];
      let message = '\u001b[33mPolicy not set, ' +
        'All traffic will be denied\u001b[39m';
      rules = utils.validate(mockRule);
      expect(rules).to.not.be.empty;
      expect(rules).to.equal(message);
    });
  });
});
