(function() {
  'use strict';
  require('colors');
  var fs = require('fs');
  var assert = require('assert');
  var log = require('npmlog');

  module.exports = {
    log: log,
    error: {
      warning: {
        permissions: 'Policy not set, All traffic will be denied'.yellow
      },
      err: {
        required: 'group, permissions, resources, and action'.red
      }
    },

    /**
     * [validate checks for the validity of the config file]

     * @param  {[JSON]} config [contains the rules from the json file]
     * @return {[JSON]}
     */

    validate: function(config) {
      var self = this;

      /**
       * Check if config is a array
       */

      if (!Array.isArray(config)) {
        /* @covignore */
        throw new Error('Config json file should be an Array of rules');

      } else if (config.length === 0) {

        return self.error.warning.permissions;
      }

      /**
       * Ensure that the config file has the core properties
       */

      config.forEach(function(el) {
        if (el.group && el.permissions && el.action) {

          /**
           * Assert that they are of the correct type
           */

          assert.deepEqual(typeof el.group, 'string');
          assert(Array.isArray(el.permissions), true);
          assert.deepEqual(typeof el.action, 'string');

        } else {
          /* @covignore */
          return log.error('REQUIRED:', self.error.err.required);

        }
      });

      return config;
    },

    readJson: function(newPath, encoding) {
      var path = 'config.json';
      var config;

      if (newPath) {
        path = newPath;
      }

      /**
       * Read the config file with the rules.
       */

      config = JSON.parse(fs.readFileSync(path, { encoding: encoding }));

      return this.validate(config);
    },

    /**
     * [policy Gets the policy from the array
     * of rules based on the role of the user]
     * @param  {[Array]} rule
     * @param  {[String]} role
     * @return {[Object]}
     */

    policy: function(rule, role) {
      var policy = rule.filter(function(el) {
        return el.group === role;
      });
      return (policy[0]) ? policy[0] : undefined;
    },


    /**
     * [methods Gets the methods from the selected policy]
     * @param  {[Object]} policy
     * @param  {[String]} resource
     * @return {[Array/String]} Returns an array of methods
     * or a string incase a glob is used;
     */

    methods: function(policy, resource) {
      var permissions = policy.permissions.filter(function(el) {
        return el.resource === resource;
      });
      return (permissions[0]) ? permissions[0].methods : undefined;
    },
  };

})();
