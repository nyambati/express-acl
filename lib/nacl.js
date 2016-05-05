/**
 *  nacl
 *  copyright(c) 2016 - 2019 Andela Kenya Ltd
 *  MIT Lincensed
 */

(function() {
  'use strict';
  require('colors');
  require('./includes');
  var helper = require('./helpers');
  var log = require('npmlog');
  var unless = require('express-unless');
  var opt = {
    denied: {
      status: 403,
      success: false,
      error: 'ACCESS DENIED'
    }
  };

  /**
   * [config Loads the rules from our config file]
   * @param  {[options]} options [defines where the
   * config file is located, and the encoding type]
   *
   */

  var config = function(options) {
    var path, rules, encoding;
    var yml = false;

    /**
     * Get the filename
     */

    if (options && options.baseUrl) {
      yml = options.yml;
      encoding = options.encoding;
      opt.baseUrl = options.baseUrl;
    }

    var filename = yml ? 'nacl.yml' : 'nacl.json';


    filename = options && options.filename ? options.filename : filename;

    /**
     * Get the path
     */

    path = options && options.path ? options.path : path;

    /**
     * Merge filename and path
     */

    path = filename && path ? (path + '/' + filename) : filename;


    rules = helper.readJson(path, encoding, yml);

    if (!Array.isArray(rules)) {
      log.warn('WARNING', rules);
      return rules;
    }

    opt.rules = rules;

    return rules;
  };

  var getRules = function() {
    return opt.rules;
  };

  /**
   * [authorize Express middleware]
   * @param  {[type]}   req  [Th request object]
   * @param  {[type]}   res  [The response object]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */

  var authorize = function(req, res, next) {
    var method = req.method;
    var role, resource, methods, index, action, group, length, boolean,
      policy, currResource;



    /**
     * Get the role from req.decoded or req.session
     */


    resource = helper.resource(next, req.originalUrl, opt.baseUrl);
    /**
     * if not resource terminate script
     */

    if (!resource) {
      return;
    }


    /**
     * [group description]
     * @type {[type]}
     */

    role = helper.role(res, req.decoded, req.session);

    /**
     * get resource from the url
     */

    group = helper.group(res, opt.rules, role);

    /**
     * if no group
     */

    if (group) {
      policy = group.permissions[0];
      currResource = policy.resource;
      length = group.permissions.length;
      methods = policy.methods;
    } else {
      return;
    }

    /**
     * Globs/ resources
     * 1. action: "allow"
     */

    if (length === 1 && currResource === '*' && policy.action === 'allow') {
      /*
       * Allow traffic to all  resources
       * 1. Check for methods
       * 2. If its a string and a glob '*'
       * 3. Allow traffic on all methods
       * 4. If methods are defined
       * 5. Allow traffic on the defined methods and deny the rest
       *
       * If the method is a glob '*' grant access
       */

      if (typeof methods === 'string' && methods === '*') {

        return next();

        /* istanbul ignore else */
      } else if (typeof methods === 'string' && methods !== '*') {
        /* istanbul ignore next */

        throw new Error('DefinationError: Unrecognised glob, use "*"');

      }

      /**
       * [if Its an array of  methods]
       * 1. check if the method is defined
       * 2. If defined Allow traffic else deny access
       */

      if (Array.isArray(methods)) {

        index = methods.indexOf(method);

        switch (index) {
          case -1:
            return res
              .status(403)
              .send(opt.denied);
          default:
            return next();

        }
      }
    }

    /**
     * 2. Action: "deny";
     */

    if (length === 1 && currResource === '*' && policy.action === 'deny') {
      /*
       * Allow traffic to all  resources
       * 1. Check for methods
       * 2. If its a string and a glob '*'
       * 3. Allow traffic on all methods
       * 4. If methods are defined
       * 5. Allow traffic on the defined methods and deny the rest
       */

      if (typeof methods === 'string' && methods === '*') {

        return res
          .status(403)
          .send(opt.denied);
        /* istanbul ignore else */
      }

      if (typeof methods === 'string' && methods !== '*') {
        /* istanbul ignore next */

        throw new Error('DefinationError: Unrecognised glob, use "*"');
      }

      if (Array.isArray(methods)) {

        index = methods.indexOf(method);

        switch (index) {
          case -1:
            return next();
          default:
            return res
              .status(403)
              .send(opt.denied);

        }
      }

    }

    /**
     * If we have more that one group and we no glob '*'
     */

    if (length >= 1 && resource !== '*') {

      /**
       * [methods Get all the methods defined on the group]
       * @param {[Object]} [group]
       * @param {string} [resource]
       * @type {[Array]}
       */

      policy = helper.policy(group, resource);

      if (!policy) {
        return res
          .status(403)
          .send(opt.denied);
      }

      methods = policy.methods;

      /**
       * If the methods are defined with a glob "*"
       */

      if (methods && typeof methods === 'string' && methods === '*') {
        action = policy.action;

        switch (action) {
          case 'deny':
            return res
              .status(403)
              .send(opt.denied);

          case 'allow':
            return next();

        }
        /* istanbul ignore else */
      }

      if (methods && typeof methods === 'string' && methods !== '*') {

        /* istanbul ignore next */
        throw new Error('DefinationError: Unrecognised glob. use "*"');
      }

      /**
       * If the methods are defined in an array
       */


      if (Array.isArray(methods)) {
        boolean = methods.includes(method);
        switch (boolean) {
          case true:
            action = policy.action;
            switch (action) {
              case 'allow':
                return next();

              case 'deny':
                return res
                  .status(403)
                  .send(opt.denied);
            }
            /* istanbul ignore next */
            break;

          case false:
            action = policy.action;
            switch (action) {
              case 'allow':
                return res
                  .status(403)
                  .send(opt.denied);

              case 'deny':
                return next();

            }
        }
      }

    }
  };

  /**
   * Add unless to the authorize middleware.
   * By default express-acl will block all traffic to routes that have no plocy
   * defined against them, this module will enable express-acl to exclude them
   */

  authorize.unless = unless;

  /**
   * export the functionality
   *
   */

  module.exports = {
    config: config,
    utils: getRules,
    authorize: authorize
  };

  return;

})();
