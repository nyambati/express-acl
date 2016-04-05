(function() {
  'use strict';
  var fs = require('fs');
  var assert = require('assert');
  module.exports = {
    readJson: function(newPath, encoding) {
      var path = 'config.json';
      if (newPath) {
        path = newPath + path;
      }

      try {
        // specifying encoding returns a string
        // instead of a buffer
        var config = JSON.parse(fs.readFileSync(path, { encoding: encoding }));
        // validate the config.json
        if (!Array.isArray(config)) {
          throw new Error('Config.json should be an Array of rules');
        } else if (config.length === 0) {
          console.log('You have not set any permissions, Note this will denie all traffic to your server');
          return;
        }

        // Ensure that the config.json has all the properties
        config.forEach(el => {
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
        throw new Error(err.message);
      }
    }
  };
})();
