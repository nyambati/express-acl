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
 * [Gets the group from the array
 * of rules based on the role of the user]
 * @param  {[Array]} rule
 * @param  {[String]} role
 * @return {[Object]}
 */
function getGroup(res, rules, role) {
  let group = _.find(rules, { group: role });

  if (group) {
    return group;
  }

  return utils.deny(res, 404, 'REQUIRED: Group not found');
}

/**
 * [Gets the methods from the selected group]
 * @param  {[Object]} group
 * @param  {[String]} resource
 * @return {[Array/String]} Returns an array of methods
 * or a string incase a glob is used;
 */

function getPolicy(group, resource) {
  let policy = _.find(group.permissions, {
    resource: resource
  });

  if (policy) {
    return {
      methods: policy.methods,
      action: policy.action
    };
  }
  return policy;
}

function getRole(res, decoded, session) {

  if (decoded && decoded.role) {
    return decoded.role;
  }
  if (session && session.role) {
    return session.role;
  }
  return utils.deny(res, 404, 'REQUIRED: Role not found');
}

function resource(next, url, baseUrl) {
  let base = (baseUrl) ? baseUrl.match(/([A-Z])\w+/gi) : '';
  let lengthOfTheBaseUrl = (base) ? base.length : 0;
  let arr = url.match(/([A-Z])\w+/gi);

  if (arr) {
    arr = arr.splice(lengthOfTheBaseUrl);
    return arr[0];
  }
  return next();
}

module.exports = {
  getRules,
  getGroup,
  getPolicy,
  getRole,
  resource
};
