/**
 *  nacl
 *  copyright(c) 2016 - 2019 Thomas Nyambati
 *  MIT Lincensed
 */

(function() {
  'use strict';
  require('colors');
  var helper = require('./helpers'),
    log = require('npmlog');

  var opt = {
    denied: {
      status: 403,
      success: false,
      error: 'ACCESS DENIED'
    }
  };


  module.exports = {
    /**
     * [config Loads the rules from our config file]
     * @param  {[options]} options [defines where the
     * config file is located, and the encoding type]
     *
     */
    config: function(options) {
      var path, encoding;
      if (options) {
        path = options.path;
        encoding = options.encoding;
      }
      var rules = helper.readJson(path, encoding);
      if (Array.isArray(rules)) {
        opt.rules = helper.readJson(path, encoding);
      } else {
        log.warn('WARNING', rules);
      }
      return rules;
    },

    getRules: function() {
      return opt.rules;
    },

    /**
     * [authorize Express middleware]
     * @param  {[type]}   req  [Th request object]
     * @param  {[type]}   res  [The response object]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    authorize: function(req, res, next) {

      var url = req.originalUrl;
      var urlInfo = url.match(/([A-Z])\w+/gi);
      var role = (req.decoded) ? req.decoded.role : undefined ||
        (req.session) ? req.session.role : undefined;
      var resource;
      var method = req.method;
      var methods;
      var index;
      var action;
      var deny = res
        .status(403)
        .send(opt.denied);


      /**
       * [if description]
       * @param  {[type]} !urlInfo [description]
       * @return {[type]}          [description]
       */

      if (!urlInfo) {
        return next();
      } else {
        resource = urlInfo[1];
      }

      /**
       * [if description]
       * @param  {[type]} !role [description]
       * @return {[type]}       [description]
       */

      if (!role) {
        log.warn('MISSING', 'Role not defined,' +
          ' All traffic will be blocked'.yellow);
        return deny;
      }

      /**
       * [policy description]
       * @type {[type]}
       */

      var policy = helper.policy(opt.rules, role);

      /**
       * [if description]
       * @param  {[type]} !policy [description]
       * @return {[type]}         [description]
       */

      if (!policy) {
        return deny;
      }
      /**
       * Globs/ resources
       * 1. action: "allow"
       */
      var currResource = policy.permissions[0].resource;
      var length = policy.permissions.length;

      if (length === 1 && currResource === '*' && policy.action === 'allow') {
        /*
         * Allow traffic to all  resources
         * 1. Check for methods
         * 2. If its a string and a glob '*'
         * 3. Allow traffic on all methods
         * 4. If methods are defined
         * 5. Allow traffic on the defined methods and deny the rest
         */
        methods = policy.permissions[0].methods;
        /*
          If the method is a glob '*' grant access
         */
        if (typeof methods === 'string' && methods === '*') {

          return next();

        } else if (typeof methods === 'string' && methods !== '*') {

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
              return deny;

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
        methods = policy.permissions[0].methods;

        if (typeof methods === 'string' && methods === '*') {

          return deny;

        } else if (typeof methods === 'string' && methods !== '*') {

          throw new Error('DefinationError: Unrecognised glob, use "*"');

        }

        if (Array.isArray(methods)) {

          index = methods.indexOf(method);

          switch (index) {
            case -1:
              return next();
            default:
              return deny;

          }
        }

      }

      /**
       * If we have more that one policy and we no glob '*'
       */

      if (length >= 1 && policy.permissions[0].resource !== "*") {

        /**
         * [methods Get all the methods defined on the policy]
         * @param {[Object]} [policy]
         * @param {string} [resource]
         * @type {[Array]}
         */

        methods = helper.methods(policy, resource);

        /**
         * If not methods are not defined
         */
        if (!methods) {
          return deny;
        }

        /**
         * If the methods are defined with a glob "*"
         */

        if (methods && typeof methods === 'string' && methods === '*') {
          action = policy.action;

          switch (action) {
            case 'deny':
              return deny;

            case 'allow':
              return next();

            default:
              return deny;
          }
        } else if (methods && typeof methods === 'string' && methods !== '*') {

          throw new Error('DefinationError: Unrecognised glob. use "*"');
        }

        /**
         * If the methods are defined in an array
         */

        if (Array.isArray(methods) && methods.indexOf(method) !== -1) {
          action = policy.action;
          switch (action) {
            case 'allow':
              return next();

            case 'deny':
              return deny;

            default:
              return deny;
          }
        }
        // 2. When the method is defined and action is allow.
        if (Array.isArray(methods) && methods.indexOf(method) === -1) {
          action = policy.action;

          switch (action) {
            case 'allow':
              return deny;

            case 'deny':
              return next();

            default:
              return deny;
          }
        }
      }
    }
  };
})();
