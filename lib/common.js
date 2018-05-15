const yaml = require('js-yaml');
const { extname } = require('path');
const { readFileSync } = require('fs');
const assert = require('assert');
const objectPath = require('object-path');
const path = require('path');

/**
 *
 * @param {[String]} url [url string to be converted to]
 * * @return {[Array]}        [Array containing the url contents]
 */
const urlToArray = url => {
  if (typeof url !== 'string') {
    throw new Error('Only string arguments are allowed');
  }
  return url.replace(/^\/+|\/+$/gm, '').split('/');
};

const stripQueryStrings = url => url.split(/[?#]/)[0];

/**
 * deny method is used to buid the deny response Object
 *
 * @param {[String]} customMessage [The message you would like added to the response]
 * @param {[Object]} response      [The response object when access is denied]
 */

const deny = (customMessage, response) => {
  let message = customMessage ? customMessage : 'Unauthorized access';

  if (response && typeof response === 'object') {
    return response;
  }

  return {
    status: 'Access denied',
    success: false,
    message: message
  };
};

/**
 *  This method is used to ensure the correct wild card is supplied
 * @param {[String]} term
 * @param {String} name
 */

const assertIsGlobOrArray = (term, name) => {
  if (typeof term !== 'string' && !Array.isArray(term)) {
    throw new Error(`TypeError: ${name} should be a array or string`);
  }

  if (typeof term === 'string' && term !== '*') {
    throw new Error(
      `DefinitionError: Unrecognised glob "${term}" , use "*" instead`
    );
  }
};

/**
 * Reads the config file and returns its content
 *
 * @param {[String]} configFilePath [path to the location of the config file]
 */
const readConfigFile = configFilePath => {
  if (typeof configFilePath !== 'string') {
    throw new Error('TypeError: Path must be a string. Received undefined');
  }

  let configBuffer;

  try {
    configBuffer = readFileSync(path.resolve(configFilePath), 'utf8');

    if (extname(configFilePath) === '.json') {
      return JSON.parse(configBuffer);
    }

    return yaml.safeLoad(configBuffer);
  } catch (error) {
    throw Error(error);
  }
};

/**
 * Maps each policy to user group
 * @param {[Array]} policies [Array of policies ]
 */
const mapPolicyToGroup = policies => {
  if (!policies) {
    return;
  }

  const mappedPolicies = new Map();

  policies.forEach(policy => {
    assert.equal(typeof policy.group, 'string');
    assert.equal(Array.isArray(policy.permissions), true);

    policy.permissions.forEach(permission => {
      assert(typeof permission.resource, 'string');
      assertIsGlobOrArray(permission.methods, 'Methods');
      if (permission.action !== 'allow' && permission.action !== 'deny') {
        throw new Error('TypeError: action should be either "deny" or "allow"');
      }
    });
    // Transform policies into a map
    mappedPolicies.set(policy.group, policy.permissions);
  });
  return mappedPolicies;
};

/**
 *  Validates policies and ensure
 * @param {[Array]} policies
 */
const validatePolicies = policies => {
  if (!Array.isArray(policies)) {
    throw new Error('TypeError: Expected Array but got ' + typeof policies);
  }
  return mapPolicyToGroup(policies);
};

const createRegexFromResource = resource => {
  if (resource.startsWith(':') || resource === '*') {
    return '.*';
  }
  return `^${resource}$`;
};

const matchUrlToResource = (route, resource) => {
  if (resource === '*') return true;

  //  create an array form both route url and resource
  const routeArray = urlToArray(route);
  const resourceArray = urlToArray(resource);

  for (let key in routeArray) {
    if (key >= resourceArray.length) return false;

    if (resourceArray[key] === '*') return true;

    if (!routeArray[key].match(createRegexFromResource(resourceArray[key])))
      return false;
  }

  if (resourceArray.length > routeArray.length) {
    return resourceArray[routeArray.length] == '*';
  }

  return true;
};

const getPrefix = resource => resource.slice(0, resource.length - 2);

const findPermissionForRoute = (route, method, prefix = '', policy) => {
  // Strip query strings from route
  route = stripQueryStrings(route);

  for (let permission of policy) {
    let resource = permission.resource;
    // check if route prefix has been specified
    if (prefix) {
      resource = `${prefix}/${resource}`.replace(/\/+/g, '/');
    }

    if (permission.subRoutes && permission.resource !== '*') {
      const currentPrefix = resource.endsWith('/*')
        ? getPrefix(resource)
        : resource;

      let currentPermission = findPermissionForRoute(
        route,
        method,
        currentPrefix,
        permission.subRoutes
      );
      if (currentPermission) {
        return currentPermission;
      }
    }

    if (matchUrlToResource(route, resource)) {
      return permission;
    }
  }
};

const isAllowed = (method, permission) => {
  const isGlobOrHasMethod =
    permission.methods === '*' || permission.methods.includes(method);
  switch (isGlobOrHasMethod) {
    case true:
      return permission.action === 'allow' ? true : false;
    default:
      return permission.action === 'allow' ? false : true;
  }
};

const checkIfHasAccess = (
  method,
  res,
  next,
  permission,
  customMessage,
  response
) => {
  if (isAllowed(method, permission)) {
    return next();
  }
  return res.json(deny(customMessage, response));
};

const findRoleFromRequest = (
  req,
  searchPath,
  defaultRole,
  decodedObjectName
) => {
  if (searchPath && objectPath.get(req, searchPath)) {
    return objectPath.get(req, searchPath);
  }

  if (decodedObjectName && objectPath.get(req, `${decodedObjectName}.role`)) {
    return objectPath.get(req, `${decodedObjectName}.role`);
  }

  if (req.decoded && req.decoded.role) {
    return objectPath.get(req, 'decoded.role');
  }

  if (req.session && req.session.role) {
    return objectPath.get(req, 'session.role');
  }

  return defaultRole;
};

module.exports = {
  urlToArray,
  readConfigFile,
  mapPolicyToGroup,
  findRoleFromRequest,
  findPermissionForRoute,
  checkIfHasAccess,
  isAllowed,
  validatePolicies,
  matchUrlToResource,
  assertIsGlobOrArray,
  deny
};
