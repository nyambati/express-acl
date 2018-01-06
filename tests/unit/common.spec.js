const assert = require('assert');

const {
  deny,
  urlToArray,
  assertIsGlobOrArray,
  readConfigFile,
} = require('../../lib/common');

describe('Unit test for ACL functionality', _ => {
  context('Test Deny function', _ => {
    it('Should exist and be a function', done => {
      assert(deny, true);
      assert(typeof deny, 'function');
      done();
    });

    it('Should return default deny Object when called wthout arguments', done => {
      const defaultResponse = {
        status: 'Access denied',
        success: false,
        message: 'Unauthorized access',
      };
      assert.deepEqual(deny(), defaultResponse);
      done();
    });

    it('Should return Object with custom message when custom message is defined', done => {
      const expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'This is a custom message',
      };
      assert.deepEqual(deny('This is a custom message'), expectedResponse);
      done();
    });

    it('Should return specified response when specified', done => {
      const response = {
        status: 'Success',
        code: 401,
        message: 'Acccess Denied',
      };

      assert.deepEqual(deny(null, response), response);
      done();
    });
  });
  context('Test urlToArray function', _ => {
    it('Should exist and is an function', done => {
      assert(urlToArray, true);
      assert(typeof urlToArray, 'function');
      done();
    });

    it('Should return an array when supplied with a url string', done => {
      assert(urlToArray('/king/of/the/world'), ['king', 'of', 'the', 'world']);
      done();
    });

    it('Should only accept string arguments', done => {
      try {
        urlToArray([]);
      } catch (error) {
        assert(error.message, 'Only string arguments are allowed');
      }
      done();
    });
  });
  context('Test assertIsGlobOrArray function', _ => {
    it('Should exist and is a function', done => {
      assert(assertIsGlobOrArray, true);
      assert(typeof assertIsGlobOrArray, 'function');
      done();
    });

    it('Should allow only array and wild cart string', done => {
      assert.equal(assertIsGlobOrArray([], 'Methods'), undefined);
      assert.equal(assertIsGlobOrArray('*', 'Methods'), undefined);
      done();
    });

    it('Should throw an error if first argument is no string or Array', done => {
      try {
        assertIsGlobOrArray({}, 'Methods');
      } catch ({message}) {
        assert.equal(message, 'TypeError: Methods should be a array or string');
      }
      done();
    });

    it('Should throw an error if the methods supplied is string but not *', done => {
      try {
        assertIsGlobOrArray('?', 'Methods');
      } catch ({message}) {
        assert.equal(
          message,
          'DefinitionError: Unrecognised glob "?" , use "*" instead'
        );
      }
      done();
    });
  });

  context('Test readConfigFile function', _ => {
    it('Should exist and be a function', done => {
      assert(readConfigFile, true);
      assert(typeof readConfigFile, 'function');
      done();
    });
    it('Should read the correct file', done => {
      const config = readConfigFile('nacl.json');
      const expectedFile = require('../../nacl.json');
      assert(config, true);
      assert(typeof config, 'object');
      assert(Array.isArray(config), true);
      assert(config, expectedFile);
      done();
    });
  });
});
