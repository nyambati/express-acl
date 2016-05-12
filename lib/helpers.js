(function() {
  'use strict';

  require('colors');
  var fs = require('fs'),
    assert = require('assert'),
    log = require('npmlog'),
    utils = require('./utils'),
    yaml = require('js-yaml'),
    _ = require('lodash');

  var error = {
    warning: 'Policy not set, All traffic will be denied'.yellow,
    required: 'group, permissions, resources,'.red,
    missing: 'Role not defined. All traffic will be blocked'.yellow
  };

  /**
   * Ensure that rules has the core properties
   * @param {[JSON]} rules
   • @return {[JSON]}
  */
  var checkProperties = function(rules) {
    var permissions;

    _.each(rules, function(el) {
      if ((typeof el.group === 'string') && (_.isArray(el.permissions))) {
        permissions = el.permissions;

        _.each(permissions, function(policy) {
          assert(policy.resource, true);
          assert(policy.methods, true);
          assert(policy.action, true);
        });
      } else {
        /* istanbul ignore next */
        return log.error('REQUIRED:', error.required);
      }
    });
    return rules;
  };

  /**
   * [Checks the validity of the rules]
   * @param  {[JSON]} rules
   * @return {[JSON]}
   */
  var validate = function(rules) {
    if (!_.isArray(rules)) {
      /* istanbul ignore next */
      throw new Error('TypeError: Expected Array but got ' + typeof rules);
    }
    if (rules.length === 0) {
      return error.warning;
    }
    return checkProperties(rules);
  };


  module.exports = {
    error: error,

    /**
     * Get the rules from the specified file path
     * @param {[String]} path
     * @param {[String]} encoding
     * @param {[Boolean]} isYaml
     * @return {[JSON]}
     */
    getRules: function(path, encoding, isYaml) {
      var rules, buffer;

      try {
        buffer = fs.readFileSync(path, {
          encoding: encoding
        });

        rules = (isYaml) ? yaml.safeLoad(buffer) : JSON.parse(buffer);
      } catch (e) {
        /* istanbul ignore next */
        throw Error(e);
      }

      return validate(rules);

    },

    /**
     * [Gets the group from the array
     * of rules based on the role of the user]
     * @param  {[Array]} rule
     * @param  {[String]} role
     * @return {[Object]}
     */
    getGroup: function(res, rules, role) {
      var group = _.find(rules, { group: role });
      var message = 'REQUIRED: Group not found';

      if (group) {
        return group;
      }
      return utils.deny(res, 404, message);
    },

    /**
     * [Gets the methods from the selected group]
     * @param  {[Object]} group
     * @param  {[String]} resource
     * @return {[Array/String]} Returns an array of methods
     * or a string incase a glob is used;
     */
    getPolicy: function(group, resource) {
      var policy = _.find(group.permissions, {
        resource: resource
      });

      if (policy) {
        return {
          methods: policy.methods,
          action: policy.action
        };
      }
      return policy;
    },

    getRole: function(res, decoded, session) {
      var message = 'REQUIRED: Role not found';

      if (decoded && decoded.role) {
        return decoded.role;
      }
      if (session && session.role) {
        return session.role;
      }
      return utils.deny(res, 404, message);
    },

    resource: function(next, url, baseUrl) {
      var base = (baseUrl) ? baseUrl.match(/([A-Z])\w+/gi) : null;
      var lengthOfTheBaseUrl = (base) ? base.length : 0;
      var arr = url.match(/([A-Z])\w+/gi);

      if (arr) {
        arr = arr.splice(lengthOfTheBaseUrl);
        return arr[0];
      }
      return next();
    }
  };

  return;
})();
