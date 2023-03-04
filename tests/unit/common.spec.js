const assert = require('assert');
const http = require('node-mocks-http');
const yaml = require('js-yaml');
const fs = require('fs');

const {
  deny,
  urlToArray,
  assertIsGlobOrArray,
  readConfigFile,
  mapPolicyToGroup,
  findRoleFromRequest,
  findPermissionForRoute,
  checkIfHasAccess,
  isAllowed,
  matchUrlToResource,
  validatePolicies
} = require('../../lib/common');

describe('Unit test for ACL functionality', () => {
  context('Test Deny function', () => {
    it('Should exist and be a function', done => {
      assert(deny, true);
      assert(typeof deny, 'function');
      done();
    });

    it('Should return default deny Object when called wthout arguments', done => {
      const defaultResponse = {
        status: 'Access denied',
        success: false,
        message: 'Unauthorized access'
      };
      assert.deepEqual(deny(), defaultResponse);
      done();
    });

    it('Should return Object with custom message when custom message is defined', done => {
      const expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'This is a custom message'
      };
      assert.deepEqual(deny('This is a custom message'), expectedResponse);
      done();
    });

    it('Should return specified response when specified', done => {
      const response = {
        status: 'Success',
        code: 401,
        message: 'Acccess Denied'
      };

      assert.deepEqual(deny(null, response), response);
      done();
    });
  });

  context('Test urlToArray function', () => {
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

  context('Test assertIsGlobOrArray function', () => {
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
      } catch ({ message }) {
        assert.equal(message, 'TypeError: Methods should be a array or string');
      }
      done();
    });

    it('Should throw an error if the methods supplied is string but not *', done => {
      try {
        assertIsGlobOrArray('?', 'Methods');
      } catch ({ message }) {
        assert.equal(
          message,
          'DefinitionError: Unrecognised glob "?" , use "*" instead'
        );
      }
      done();
    });
  });

  context('Test readConfigFile function', () => {
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
      assert.deepEqual(config, expectedFile);
      // Read yaml file
      const expectedConfig = yaml.load(
        fs.readFileSync('tests/config/nacl.yml')
      );
      const yamlConfig = readConfigFile('tests/config/nacl.yml');

      assert(yamlConfig, true);
      assert(Array.isArray(yamlConfig), true);
      assert.deepEqual(expectedConfig, yamlConfig);
      done();
    });
    it('Should throw an error is file is missing', done => {
      try {
        readConfigFile();
      } catch ({ message }) {
        assert.equal(
          message,
          'TypeError: Path must be a string. Received undefined'
        );
      }
      done();
    });
  });

  context('Test mapPolicyToGroup function', () => {
    it('It should exist and should be a function', done => {
      assert(mapPolicyToGroup, true);
      assert(typeof mapPolicyToGroup, 'function');
      done();
    });

    it('Should return undefined if no policies are supplied', done => {
      assert.equal(mapPolicyToGroup(), undefined);
      done();
    });
    it('Should only map valid policy', done => {
      const invalidPolicy = [
        {
          group: 'user',
          permissions: [
            {
              resource: 'users/*',
              methods: ['POST', 'GET', 'PUT'],
              action: 'none'
            }
          ]
        }
      ];
      try {
        mapPolicyToGroup(invalidPolicy);
      } catch ({ message }) {
        assert.equal(
          message,
          'TypeError: action should be either "deny" or "allow"'
        );
      }
      done();
    });
    it('Should convert array policies into a map', done => {
      const policiesArray = require('../../nacl.json');
      const mappedPolicies = mapPolicyToGroup(policiesArray);

      assert(mappedPolicies, true);
      assert(typeof mapPolicyToGroup, 'object');
      assert(mappedPolicies.has('user'), true);
      assert(typeof mappedPolicies.get('user'), 'object');
      done();
    });
  });

  context('Test validatePolicies function', () => {
    it('Should exist and should be a function', done => {
      assert(validatePolicies, true);
      assert(typeof validatePolicies, 'function');
      done();
    });
    it('Should only return valid policy', done => {
      const policies = require('../../nacl.json');
      const map = validatePolicies(policies);
      assert(map, true);
      assert(typeof map, 'object');
      assert(map.has('user', true));

      try {
        validatePolicies({});
      } catch ({ message }) {
        assert(message, true);
        assert.equal(message, 'TypeError: Expected Array but got object');
      }

      done();
    });
  });

  context('Test findRoleFromRequest', () => {
    it('Should exist and should be a function', done => {
      assert(findRoleFromRequest, true);
      assert(typeof findRoleFromRequest, 'function');
      done();
    });

    it('Should find role from decoded and session', done => {
      const req = http.createRequest();
      let role;
      req.decoded = {
        role: 'user'
      };

      role = findRoleFromRequest(req);
      assert(role, true);
      assert.equal(role, req.decoded.role);

      req.decoded = {};
      req.session = {
        role: 'user'
      };

      role = findRoleFromRequest(req);
      assert(role, true);
      assert.equal(role, req.session.role);
      done();
    });

    it('Should return default role if none is defined', done => {
      const req = http.createRequest();
      let role = findRoleFromRequest(req, null, 'guest');
      assert(role, true);
      assert.equal(role, 'guest');
      done();
    });

    it('Should return role from specified decoded object name', done => {
      const req = http.createRequest();
      req.user = {
        credentials: {
          role: 'user'
        }
      };

      let role = findRoleFromRequest(req, null, null, 'user.credentials');
      assert(role, true);
      assert.equal(role, 'user');
      done();
    });
    it('Should return role from specified search path', done => {
      const req = http.createRequest();
      req.user = {
        credentials: {
          role: 'user'
        }
      };

      let role = findRoleFromRequest(req, 'user.credentials.role');
      assert(role, true);
      assert.equal(role, 'user');
      done();
    });
  });

  context('Test findPermissionForRoute function', () => {
    it('Should exist and should be a function', done => {
      assert(findPermissionForRoute, true);
      assert(typeof findPermissionForRoute, 'function');
      done();
    });
    it('Should return appropriate permissions given a specific route', done => {
      const policy = [
        {
          resource: 'users/*',
          methods: ['POST', 'GET', 'PUT'],
          action: 'allow',
          subRoutes: [
            {
              resource: 'public',
              methods: '*',
              action: 'allow'
            }
          ]
        }
      ];

      let expectedPermissions = {
        resource: 'public',
        methods: '*',
        action: 'allow'
      };

      let permissions = findPermissionForRoute(
        '/users/public',
        'GET',
        '',
        policy
      );

      assert(permissions, true);
      assert.deepEqual(permissions, expectedPermissions);

      expectedPermissions = {
        resource: 'users/*',
        methods: ['POST', 'GET', 'PUT'],
        action: 'allow',
        subRoutes: [
          {
            resource: 'public',
            methods: '*',
            action: 'allow'
          }
        ]
      };

      permissions = findPermissionForRoute('/users/king', 'GET', '', policy);
      assert(permissions, true);
      assert.deepEqual(permissions, expectedPermissions);

      permissions = findPermissionForRoute(
        '/api/users/king',
        'GET',
        'api',
        policy
      );

      assert(permissions, true);
      assert.deepEqual(permissions, expectedPermissions);

      permissions = findPermissionForRoute('/api/king', 'GET', 'api', policy);
      assert.equal(permissions, undefined);
      done();
    });
  });
  context('Test matchUrlToResource', () => {
    it('Should exist and should be a function', done => {
      assert(matchUrlToResource, true);
      assert(typeof matchUrlToResource, 'function');
      done();
    });
    it('Should return true or false when given url and resource', done => {
      assert.equal(matchUrlToResource('/api/users', '*'), true);
      assert.equal(matchUrlToResource('/api/users', '/api/users'), true);
      assert.equal(matchUrlToResource('/api/users', '/king/mong'), false);
      assert.equal(matchUrlToResource('/api/users/king', '/api/users/*'), true);
      assert.equal(matchUrlToResource('/api/users/king', '/api/users'), false);
      done();
    });

    it;
  });

  context('Test checkIfHasAcess function', () => {
    it('Should exist and should be a function', done => {
      assert(checkIfHasAccess, true);
      assert(typeof checkIfHasAccess, 'function');
      done();
    });

    it('Should return appropriate response when checking for access', done => {
      const res = http.createResponse();
      const next = () => {
        return {
          message: 'ACCESS GRANTED'
        };
      };

      const permission = {
        resource: 'users/*',
        methods: ['POST', 'GET', 'PUT'],
        action: 'allow'
      };

      assert.deepEqual(checkIfHasAccess('GET', res, next, permission), next());
      checkIfHasAccess('DELETE', res, next, permission);
      const data = JSON.parse(res._getData());
      assert.deepEqual(data, {
        status: 'Access denied',
        success: false,
        message: 'Unauthorized access'
      });
      done();
    });
  });

  context('Test isAllowed function', () => {
    it('Should return true of false if method is allowed', done => {
      const permission = {
        resource: 'users/*',
        methods: ['POST', 'GET', 'PUT'],
        action: 'allow'
      };

      assert.equal(isAllowed('GET', permission), true);
      assert.equal(isAllowed('DELETE', permission), false);
      done();
    });
  });
});
