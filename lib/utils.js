(function() {
  'use strict';
  var _ = require('lodash');
  var error = new Error('DefinitionError: Unrecognised glob, use "*"');
  var index;


  module.exports = {

    deny: function(res, status, customMessage) {
      var message = customMessage ? customMessage : 'Unauthorized access';
      return res.status(status)
        .send({
          status: 'Access denied',
          success: false,
          message: message
        });
    },

    whenGlobAndActionAllow: function(res, next, method, methods) {
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
      if (_.isString(methods)) {
        switch (methods) {
          case '*':
            return next();
          default:
            throw error;
        }
      }


      /**
       * [if Its an array of  methods]
       * 1. check if the method is defined
       * 2. If defined Allow traffic else deny access
       */

      if (_.isArray(methods)) {
        index = methods.indexOf(method);

        switch (index) {
          case -1:
            return this.deny(res, 403);
          default:
            return next();

        }
      }
    },

    whenGlobAndActionDeny: function(res, next, method, methods) {
      /*
       * Allow traffic to all  resources
       * 1. Check for methods
       * 2. If its a string and a glob '*'
       * 3. Allow traffic on all methods
       * 4. If methods are defined
       * 5. Allow traffic on the defined methods and deny the rest
       */
      if (_.isString(methods)) {
        switch (methods) {
          case '*':
            return this.deny(res, 403);
          default:
            throw error;
        }
      }

      if (_.isArray(methods)) {
        index = methods.indexOf(method);
        switch (index) {
          case -1:
            return next();
          default:
            return this.deny(res, 403);
        }
      }
    },

    whenResourceAndMethodGlob: function(res, next, action, methods) {
      switch (methods) {
        case '*':
          switch (action) {
            case 'deny':
              return this.deny(res, 403);
            default:
              return next();
          }
          /* istanbul ignore next */
          break;
        default:
          throw error;
      }
    },

    whenIsArrayMethod: function(res, next, action, method, methods) {
      var boolean = _.includes(methods, method);
      switch (boolean) {
        case true:
          switch (action) {
            case 'allow':
              return next();
            default:
              return this.deny(res, 403);
          }
          /* istanbul ignore next */
          break;

        case false:
          switch (action) {
            case 'allow':
              return this.deny(res, 403);
            default:
              return next();
          }
      }
    }
  };
})();
