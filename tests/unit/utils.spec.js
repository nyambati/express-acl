(function() {
  'use strict';
  var expect = require('chai').expect,
    assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    utils = require('../../lib/utils');

  describe('Testing Utils', function() {
    // mock res
    var res, data, next, method;

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

    var methods = ['GET', 'PUT', 'DELETE'];

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

        it('Should throw Error if wrong glob is passed', function() {
          try {
            utils.whenGlobAndActionAllow(null, null, null, '&');
          } catch (error) {
            var err = 'DefinitionError: Unrecognised glob, use "*"';
            expect(error.message).to.deep.equal(err);
          }
        });

      });

      context('When the methods are an Array', function() {

        it('Should call next if methods is Array and method exist', function() {
          method = 'GET';

          utils.whenGlobAndActionAllow(res, next, method, methods);

          data = res._getData();

          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.success);

        });

        it('Should return deny response if method does not exist', function() {
          method = 'PATCH';
          utils.whenGlobAndActionAllow(res, next, method, methods);
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
          utils.whenGlobAndActionDeny(res, null, null, '*');

          data = res._getData();

          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.restricted);
        });

        it('Should throw Error if wrong glob is passed', function() {
          try {
            utils.whenGlobAndActionDeny(null, null, null, '&');
          } catch (error) {
            var err = 'DefinitionError: Unrecognised glob, use "*"';
            expect(error.message).to.deep.equal(err);
          }
        });

      });


      context('When the methods are an Array', function() {
        it('Should call next if methods is Array and method exist', function() {
          method = 'GET';

          utils.whenGlobAndActionDeny(res, next, method, methods);

          data = res._getData();

          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.restricted);

        });

        it('Should return deny response if method does not exist', function() {
          method = 'PATCH';
          utils.whenGlobAndActionDeny(res, next, method, methods);
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
        utils.whenResourceAndMethodGlob(res, next, 'deny', '*');

        data = res._getData();

        assert(data, true);
        expect(data).to.be.an('object');
        assert.deepEqual(data, response.restricted);
      });

      it('Should throw Error if wrong glob is passed', function() {
        try {
          utils.whenResourceAndMethodGlob(null, null, null, '&');
        } catch (error) {
          var err = 'DefinitionError: Unrecognised glob, use "*"';
          expect(error.message).to.deep.equal(err);
        }
      });

    });

    describe('Utils.whenIsArrayMethod', function() {
      context('When action allow', function() {

        it('Should call next if method exist', function() {
          utils.whenIsArrayMethod(res, next, 'allow', 'GET', methods);
          data = res._getData();
          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.success);
        });

        it('Should return deny response if method doesn\'t exist', function() {
          utils.whenIsArrayMethod(res, next, 'allow', 'PATCH', methods);
          data = res._getData();
          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.restricted);
        });

      });

      context('When action deny', function() {

        it('Should return deny response if method exist', function() {
          utils.whenIsArrayMethod(res, next, 'deny', 'GET', methods);
          data = res._getData();
          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.restricted);
        });

        it('Should call next if method doesn\'t exist', function() {
          utils.whenIsArrayMethod(res, next, 'deny', 'PATCH', methods);
          data = res._getData();
          assert(data, true);
          expect(data).to.be.an('object');
          assert.deepEqual(data, response.success);
        });
      });
    });

    describe('Check properties', function() {
      it('Should assert core properties and return the rules', function() {
        var mockRule = [{
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
        var rules = utils.checkProperties(mockRule);

        expect(rules).to.not.be.empty;
        expect(rules).to.be.instanceof(Array);
      });
    });

    describe('Validate', function() {
      var rules;

      it('Should return rules once validated', function() {
        var mockRule = [{
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

        expect(rules).to.not.be.empty;
        expect(rules).to.be.instanceof(Array);
      });

      it('Should throw an error when rules is not an array', function() {
        var mockRule = {
          group: 'user'
        };
        try{
          utils.validate(mockRule);
        } catch(error) {
          expect(utils.validate).to.throw(Error);
        }
      });

      it('Should return a message when rules is empty', function() {
        var mockRule = [];
        var message = '\u001b[33mPolicy not set, ' + 
          'All traffic will be denied\u001b[39m';
        rules = utils.validate(mockRule);

        expect(rules).to.not.be.empty;
        expect(rules).to.equal(message);
      });
    });
  });
})();
