/**
 *  nacl
 *  copyright(c) 2016 - 2019 Andela Kenya Ltd
 *  MIT Lincensed
 */

(function() {
  'use strict';
  require('colors');
  var helper = require('./helpers'),
    utils = require('./utils'),
    log = require('npmlog'),
    unless = require('express-unless'),
    _ = require('lodash'),
    opt = {};
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


    rules = helper.getRules(path, encoding, yml);

    if (!_.isArray(rules)) {
      log.warn('WARNING', rules);
      return rules;
    }

    opt.rules = rules;

    return rules;
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
    var role, methods, action, group, length, message, policy, currResource;



    /**
     * Get the role from req.decoded or req.session
     */


    var resource = helper.resource(next, req.originalUrl, opt.baseUrl);
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

    role = helper.getRole(res, req.decoded, req.session);

    if (!role) {
      return;
    }

    /**
     * get resource from the url
     */

    group = helper.getGroup(res, opt.rules, role);

    /**
     * if no group
     */

    if (!group) {
      return;
    }

    policy = _.head(group.permissions);
    currResource = policy.resource;
    length = group.permissions.length;
    methods = policy.methods;

    /**
     * Globs/ resources
     */

    if (length === 1 && currResource === '*') {
      action = policy.action;
      switch (action) {
        case 'allow':
          return utils.whenGlobAndActionAllow(res, next, method, methods);
        default:
          return utils.whenGlobAndActionDeny(res, next, method, methods);
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

      policy = helper.getPolicy(group, resource);

      if (!policy) {
        message = 'REQUIRED: Policy not found';
        return utils.deny(res, 404, message);
      }

      methods = policy.methods;

      /**
       * If the methods are defined with a glob "*"
       */

      if (methods && _.isString(methods)) {
        action = policy.action;
        return utils.whenResourceAndMethodGlob(res, next, action, methods);
      }

      /**
       * If the methods are defined in an array
       */


      if (_.isArray(methods)) {
        action = policy.action;
        return utils.whenIsArrayMethod(res, next, action, method, methods);
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
    authorize: authorize
  };

  return;

})();
