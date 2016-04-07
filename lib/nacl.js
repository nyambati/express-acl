/**
 *  nacl
 *  copyright(c) 2016 - 2019 Thomas Nyambati
 *  MIT Lincensed
 */

(function() {
  'use strict';
  var helper = require('./helpers');
  var opt = {
    denied: {
      status: 401,
      success: false,
      Error: 'ACCESS DENIED'
    }
  };



  module.exports = {
    /**
     * [config Loads the rules from our config file]
     * @param  {[options]} options [defines where the config file is located, and the encoding type]
     *
     */
    config: function(options) {
      var path, encoding;
      if (options) {
        path = options.path;
        encoding = options.encoding;
      }
      opt.rules = helper.readJson(path, encoding);
      return opt;
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
      var role = (req.decoded) ? req.decoded.role :
        console.log('WARNING: '.yellow + 'Role missing in req.session or req.decoded') || (req.session) ? req.session.role :
        console.log('WARNING: '.yellow + 'Role missing in req.session or req.decoded');
      var resource;
      var method = req.method;

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
        return res
          .status(401)
          .send(opt.denied);
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
        return res.
        status(403)
          .send(opt.denied);
      }

      if (policy.permissions[0].resource === '*') {
        return next();
      } else {
        // If we have a policy let
        // check if the the method has a glob or an array
        var methods = helper.methods(policy, resource);
        // if methods has '*' give the user access to the resource
        if (!methods) {
          return res
            .status(403)
            .send(opt.denied);
        }

        if (methods && typeof methods === 'string' && methods === '*') {
          return next();
        }
        // if the methods have been specified
        // 1. When the method is defined and action is allow.

        if (Array.isArray(methods) && methods.indexOf(method) !== -1 && policy.action === 'allow') {
          return next();
        }
        // 2. When the method is defined and action is allow.
        if (Array.isArray(methods) && methods.indexOf(method) !== -1 && policy.action === 'deny') {
          return res
            .status(403)
            .send(opt.denied);
        }
        // 3. When the method is not defined and action is allow.
        // This means that your the traffic is allowed only for the speciifed crud operations
        if (Array.isArray(methods) && methods.indexOf(method) === -1 && policy.action === 'allow') {
          return res
            .status(403)
            .send(opt.denied);
        }
        // 4. When the method is not defined and action is deny.
        // This means that your policy denies access to this operation but allows the rest

        if (Array.isArray(methods) && methods.indexOf(method) === -1 && policy.action === 'deny') {
          return next();
        }
      }
    }
  };
})();
