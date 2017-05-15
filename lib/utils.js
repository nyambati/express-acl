'use strict';
const _ = require('lodash');
const assert = require('assert');

/**
 * [deny sends Deny response ]
 * @param  {[Object]} res           [Express response object]
 * @param  {[Number]} status        [Status code]
 * @param  {[String]} customMessage [error your are reporting]
 * @return {[Object]}               [Response message returned to client]
 */

function deny(res, status, customMessage, response) {
  let message = customMessage ? customMessage : 'Unauthorized access';

  if (response && typeof response === 'object') {
    return res.status(status).send(response);
  }

  return res.status(status)
    .send({
      status: 'Access denied',
      success: false,
      message: message
    });
}

/*
 * Allow traffic to all resources
 * 1. Check for methods
 * 2. If its a string and a glob '*'
 * 3. Allow traffic on all methods
 * 4. If methods are defined
 * 5. Allow traffic on the defined methods and deny the rest
 *
 * If the method is a glob '*' grant access
 */

function whenGlobAndActionAllow(res, next, method, methods, response) {
  if (_.isString(methods)) return next();

  /**
   * [if Its an array of  methods]
   * 1. check if the method is defined
   * 2. If defined Allow traffic else deny access
   */

  if (_.isArray(methods)) {
    let index = methods.indexOf(method);

    switch (index) {
      case -1:
        return deny(res, 403, null, response);
      default:
        return next();
    }
  }
}

/*
 * Allow traffic to all resources
 * 1. Check for methods
 * 2. If its a string and a glob '*'
 * 3. Allow traffic on all methods
 * 4. If methods are defined
 * 5. Allow traffic on the defined methods and deny the rest
 */

function whenGlobAndActionDeny(res, next, method, methods, response) {
  if (_.isString(methods)) {
    return deny(res, 403, null, response);
  }

  if (_.isArray(methods)) {
    let index = methods.indexOf(method);
    switch (index) {
      case -1:
        return next();
      default:
        return deny(res, 403, null, response);
    }
  }
}

/**
 * When a resource is matched
 * And the methods are denoted by glob "*"
 */

function whenResourceAndMethodGlob(res, next, action, response) {
  switch (action) {
    case 'deny':
      return deny(res, 403, null, response);
    default:
      return next();
  }
}

/**
 * [whenIsArrayMethod When the methods in policy are an array]
 * @param  {[type]}   res     [Express resposnse object]
 * @param  {Function} next    [Express next function]
 * @param  {[type]}   action  [Policy action]
 * @param  {[type]}   method  [Methid from the request object]
 * @param  {[type]}   methods [Policy methods]
 */

function whenIsArrayMethod(res, next, action, method, methods, response) {
  let boolean = _.includes(methods, method);
  switch (boolean) {
    case true:
      switch (action) {
        case 'allow':
          return next();
        default:
          return deny(res, 403, null, response);
      }
      /* istanbul ignore next */
      break;
    case false:
      switch (action) {
        case 'allow':
          return deny(res, 403, null, response);
        default:
          return next();
      }
  }
}

/**
 * Ensure that rules has the core properties
 * @param {[JSON]} rules
 • @return {[JSON]}
*/

function assertIsGlobOrArray(term, name) {
  if (typeof term !== 'string' && !_.isArray(term)) {
    throw new Error(`TypeError: ${name} should be a array or string`);
  }

  if (typeof term === 'string' && term !== '*') {
    throw new Error(
      `DefinitionError: Unrecognised glob "${term}" , use "*" instead`
    );
  }
}

function checkProperties(rules) {
  let rulesMap = new Map();

  for (let rule of rules) {
    assert.equal(typeof rule.group, 'string');
    assertIsGlobOrArray(rule.permissions, 'Permissions');

    for (let policy of rule.permissions) {
      assert(typeof policy.resource, 'string');
      assertIsGlobOrArray(policy.methods, 'Methods');

      if (policy.action !== 'allow' && policy.action !== 'deny') {
        throw new Error('TypeError: action should be either "deny" or "allow"');
      }
    }

    rulesMap.set(rule.group, rule.permissions);

  }

  return rulesMap;
}

/**
 * [Checks the validity of the rules]
 * @param  {[JSON]} rules
 * @return {[JSON]}
 */

function validate(rules) {

  if (!_.isArray(rules)) {
    throw new Error('TypeError: Expected Array but got ' + typeof rules);
  }

  if (rules.length === 0) {
    return '\u001b[33mPolicy not set, All traffic will be denied\u001b[39m';
  }

  return checkProperties(rules);
}


module.exports = {
  whenIsArrayMethod,
  whenResourceAndMethodGlob,
  whenGlobAndActionDeny,
  whenGlobAndActionAllow,
  checkProperties,
  validate,
  deny
};
