(function() {
  'use strict';
  require('colors');
  var fs = require('fs'),
    assert = require('assert'),
    log = require('npmlog');
  module.exports = {
    error: {
      warning: {
        permissions: 'Policy not set, All traffic will be denied'.yellow
      }
    },
    /**
     * [readJson description]
     * @param  {[string]} newPath  [The path to the config.json file with ACL rules]
     * @param  {[string]} encoding [description]
     * @return {[JSON]}          [The json file]
     */
    readJson: function(newPath, encoding) {
      var path = 'config.json';
      if (newPath) {
        path = newPath;
      }

      try {
        // specifying encoding returns a string
        // instead of a buffer
        var config = JSON.parse(fs.readFileSync(path, { encoding: encoding }));
        // validate the config.json
        if (!Array.isArray(config)) {
          throw new Error('Config.json should be an Array of rules');
        } else if (config.length === 0) {
          log.warn('WARNING', this.error.warning.permissions);
          return;
        }

        // Ensure that the config.json has all the properties
        config.forEach(function(el) {
          if (el.group && el.permissions && el.action) {
            // assert that they are of the corret type.
            assert.deepEqual(typeof el.group, 'string');
            assert(Array.isArray(el.permissions), true);
            assert.deepEqual(typeof el.action, 'string');
          } else {
            throw new Error('Missing property: Ensure config.json has: group, permissions, resources, and action');
          }
        });

        return config;

      } catch (err) {
        throw new Error(err);
      }
    },

    policy: function(rule, role) {
      return rule.filter(function(el) {
        return el.group == role;
      })[0];
    },

    methods: function(policy, resource) {
      var permissions = policy.permissions.filter(function(el) {
        return el.resource === resource;
      });
      return (permissions[0]) ? permissions[0].methods : undefined;
    }
  };
})();
