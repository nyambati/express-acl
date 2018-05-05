const unless = require('express-unless');

const {
  readConfigFile,
  mapPolicyToGroup,
  findRoleFromRequest,
  findPermissionForRoute,
  checkIfHasAccess,
  deny
} = require('./common');

let options = {
  path: '.',
  filename: 'nacl.json',
  policies: new Map(),
  defaultRole: 'guest'
};

function config(config, response) {
  options = Object.assign({}, options, config, { response });

  if (config && config.rules) {
    options.policies = mapPolicyToGroup(config.rules);
  } else {
    let filePath =
      options.filename && options.path
        ? `${options.path}/${options.filename}`
        : options.filename;

    options.policies = mapPolicyToGroup(readConfigFile(filePath));
  }

  if (!options.policies.size) {
    return '\u001b[33mWARNING: You have not set any policies, All traffic will be denied\u001b[39m';
  }
  return options.policies;
}

/**
 * [authorize Express middleware]
 * @param  {[type]}   req  [Th request object]
 * @param  {[type]}   res  [The response object]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */

function authorize(req, res, next) {
  const role = findRoleFromRequest(
    req,
    options.roleSearchPath,
    options.defaultRole,
    options.decodedObjectName
  );

  if (req.originalUrl === '/') {
    return next();
  }

  const policy = options.policies.get(role);

  if (!policy) {
    return res.json({
      status: 'Access denied',
      success: false,
      message: `REQUIRED: Policy for role ${role} is not defined`
    });
  }

  const permission = findPermissionForRoute(
    req.originalUrl,
    req.method,
    options.baseUrl,
    policy
  );

  if (!permission) {
    return res.status(401).json(deny(options.customMessage, options.response));
  }

  return checkIfHasAccess(
    req.method,
    res,
    next,
    permission,
    options.customMessage,
    options.response
  );
}

authorize.unless = unless;

module.exports = {
  config,
  authorize
};
