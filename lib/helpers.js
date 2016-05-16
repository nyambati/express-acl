(function() {
  'use strict';

  var fs = require('fs'),
    utils = require('./utils'),
    yaml = require('js-yaml'),
    _ = require('lodash');

  module.exports = {
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
        throw Error(e);
      }

      return utils.validate(rules);
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
