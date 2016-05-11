(function() {
  'use strict';

  var assert = require('assert');
  var acl = require('../');
  var helper = require('../lib/helpers');

  describe('Express Access Control List Module', function() {
    var res, rules, data;

    /**
     * [Load config file]
     * @param  {[json]} )
     * this tests check whether the modules loads
     * the config file, and gives all the neccesary warnings when neccesary
     */

    describe('Loading the config file (config.json', function() {

      it('should load config jsonfile when path is specifyed', function() {

        rules = acl.config({
          filename: 'config/config.json',
          path: './tests',
          encoding: 'base64'
        });

        assert(Array.isArray(rules), true);
        assert(rules.length, 1);

      });

      it('Should load the config.json from the root folder', function() {
        rules = acl.config();

        assert(Array.isArray(rules), true);
        assert(rules.length, 1);

      });

      it('Log error when no policy is defined', function() {

        res = '\u001b[33mPolicy not set, All traffic will be denied\u001b[39m';

        rules = acl.config({
          path: './tests/config',
          filename: 'empty-policy.json'
        });

        assert(typeof rules, 'string');
        assert.deepEqual(rules, res);

      });
    });


    describe('No BaseUrl', function() {

      it('Should be able to locate the location of the resource', function() {

        var url = '/users/45gg4hht6';

        var next = function() {
          return true;
        };

        var resource = helper.resource(next, url);
        assert.deepEqual(resource, 'users');

      });

    });

    describe('With  BaseUrl', function() {
      it('Should be able to locate the location of the resource', function() {

        var url = 'developer/v1/users/45gg4hht6';

        var next = function() {
          return true;
        };

        var config = {
          baseUrl: 'developer/v1/'
        };

        var resource = helper.resource(next, url, config.baseUrl);
        assert.deepEqual(resource, 'users');

      });
    });

  });
})();
