(function() {
  'use strict';
  require('colors');
  var fs = require('fs');
  var assert = require('assert');
  var log = require('npmlog');
  var yaml = require('js-yaml');
  var _ = require('lodash');
  var error = {
    warning: {
      permissions: 'Policy not set, All traffic will be denied'.yellow
    },
    err: {
      required: 'group, permissions, resources,'.red
    }
  };


  /**
   * [validate checks for the validity of the config file]

   * @param  {[JSON]} config [contains the rules from the json file]
   * @return {[JSON]}
   */

  function validate(config) {
    var permissions;

    /**
     * Check if config is a array
     */

    if (!_.isArray(config)) {

      /* istanbul ignore next */

      throw new Error('Config json file should be an Array of rules');

    }

    if (config.length === 0) {

      return error.warning.permissions;
    }

    /**
     * Ensure that the config file has the core properties
     */

    _.each(config, function(el) {
      if (el.group && el.permissions) {

        /**
         * Assert that they are of the correct type
         */

        assert.deepEqual(typeof el.group, 'string');
        assert(Array.isArray(el.permissions), true);

        permissions = el.permissions;

        _.each(permissions, function(policy) {
          assert(policy.resource, true);
          assert(policy.methods, true);
          assert(policy.action, true);
        });

        return;
      }

      /* istanbul ignore next */

      return log.error('REQUIRED:', error.err.required);


    });

    return config;
  }

  module.exports = {
    log: log,
    error: error,

    readJson: function(path, encoding, yml) {
      var config, buffer;
      /**
       * Read the config file with the rules.
       *
       */

      try {

        buffer = fs.readFileSync(path, { encoding: encoding });

        if (yml) {
          config = yaml.safeLoad(buffer);
        } else {
          config = JSON.parse(buffer);
        }


      } catch (e) {
        /* istanbul ignore next */
        throw Error(e);
      }

      return validate(config);
    },

    /**
     * [group Gets the group from the array
     * of rules based on the role of the user]
     * @param  {[Array]} rule
     * @param  {[String]} role
     * @return {[Object]}
     */

    group: function(res, rules, role) {
      var group = _.find(rules, { group: role });

      if (group) {
        return group;
      }

      return res
        .status(403)
        .send({
          status: 403,
          success: false,
          error: 'ACCESS DENIED'
        });

    },


    /**
     * [methods Gets the methods from the selected group]
     * @param  {[Object]} group
     * @param  {[String]} resource
     * @return {[Array/String]} Returns an array of methods
     * or a string incase a glob is used;
     */

    policy: function(group, resource) {

      var policy = _.find(group.permissions, {
        resource: resource
      });

      return (policy) ? {
        methods: policy.methods,
        action: policy.action
      } : policy;

    },

    role: function(res, decoded, session) {

      if (decoded && decoded.role) {
        return decoded.role;
      }

      if (session && session.role) {
        return session.role;
      }

      log.warn('MISSING', 'Role not defined,' +
        ' All traffic will be blocked'.yellow);

      return res
        .status(403)
        .send({
          status: 403,
          success: false,
          error: 'ACCESS DENIED'
        });
    },

    resource: function(next, url, baseUrl) {
      var lengthOfTheBaseUrl = 0,
        base;
      // Get the base url in an array

      if (baseUrl) {
        base = baseUrl.match(/([A-Z])\w+/gi);
      }

      // Get the url in an array
      var arr = url.match(/([A-Z])\w+/gi);

      if (!arr) {
        return next();
      }
      // if we have the base get its length

      if (base) {
        lengthOfTheBaseUrl = base.length;
      }
      // Remove the base url from the originalUrl if it exist
      arr = arr.splice(lengthOfTheBaseUrl);
      return arr[0];

    }
  };
  return;
})();
