'use strict';
const fs = require('fs');
const utils = require('./utils');
const yaml = require('js-yaml');
const _ = require('lodash');

/**
 * Get the rules from the specified file path
 * @param {[String]} path
 * @param {[String]} encoding
 * @param {[Boolean]} isYaml
 * @return {[JSON]}
 */

function getRules(path, encoding, isYaml) {
  let rules, buffer;

  try {
    buffer = fs.readFileSync(path, { encoding });
    rules = (isYaml) ? yaml.safeLoad(buffer) : JSON.parse(buffer);
  } catch (error) {
    throw Error(error);
  }

  return utils.validate(rules);
}


/**
 * [Gets the methods from the selected group]
 * @param  {[Object]} group
 * @param  {[String]} resource
 * @return {[Array/String]} Returns an array of methods
 * or a string incase a glob is used;
 */

function getPolicy(permissions, resource) {
  let policy = _.find(permissions, { resource });

  if (policy) {
    return {
      methods: policy.methods,
      action: policy.action
    };
  }
  return policy;
}


function getRole(req, res, decodedObjectName, defaultRole) {

  /**
   * if decodedObjectName provided in configurations
   * and role is attached to request[decodedObjectName]
   * Return role
   */
  if (decodedObjectName && req[decodedObjectName] && req[decodedObjectName].role) {
    return req[decodedObjectName].role;
  }

  /**
   * if role is attached to the decoded
   * Return role
   */
  if (req.decoded && req.decoded.role) {
    return req.decoded.role;
  }

  /**
   * if role is attached to the session
   * Return role
   */
  if (req.session && req.session.role) {
    return req.session.role;
  }

  /**
   * if role is not attached to the session or decoed object
   * Return role
   */

  return defaultRole;
}


/**
 * [resource finds the resource based of the baseurl specified]
 * @param  {Function} next    [Express next function]
 * @param  {[String}  url     [Request url]
 * @param  {[String]} baseUrl [The api baseUrl]
 * @return {[String]}           [The matched resource]
 */

function resource(next, url, baseUrl) {
  let base = (baseUrl) ? baseUrl.match(/([A-Z])\w+/gi) : '';
  let lengthOfTheBaseUrl = (base) ? base.length : 0;
  let arr = url.match(/([A-Z])\w+/gi);

  if (arr) return arr.splice(lengthOfTheBaseUrl)[0];

  return next();
}

module.exports = {
  getRules,
  getPolicy,
  getRole,
  resource
};
