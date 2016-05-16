(function() {
  'use strict';
  var jwt = require('jsonwebtoken');
  var faker = require('faker');
  var acl = require('../../');

  /**
   * Configure acl
   * Add the baseUrl so that express-acl depends on this
   * to locate our resources.
   * @type {String}
   */
  // if you have none or ignore the baseUrl entirely
  // acl.config({
  //   baseUrl: '/'
  // });
  //
  //

  acl.config({
    filename: 'nacl.json',
    baseUrl: 'v1'
  });

  module.exports = function(app, express) {
    var ROUTER = express.Router();

    /**
     * [createToken create a tojen from the user data]
     * @param  {[object]} user
     * @return {[string]} token
     */
    var key = 'thisisaverysecurekey';

    var createToken = function(user) {
      var token = jwt.sign(user, key, {
        expiresInMinute: 1440
      });
      return token;
    };
    /**
     * [mockUser Fake user]
     * @type {Object}
     */

    var mockUser = {
      _id: faker.random.uuid(),
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'monk'
    };

    /**
     * Middleware to inject token to header
     * Note: this is done in the front end,
     *  therefore this code is for illustration only
     */
    ROUTER.use(function(req, res, next) {

      var token = createToken(mockUser);
      req.headers['x-access-token'] = token;
      next();
    });

    /**
     * lets create our jwt middleware
     */

    ROUTER.use(function(req, res, next) {
      var token = req.headers['x-access-token'];
      if (token) {
        jwt.verify(token, key, function(err, decoded) {
          if (err) {
            return res.send(err);
          } else {
            req.decoded = decoded;
            next();
          }

        });
      }
    });

    /**
     * our acl middleware will go here
     */

    ROUTER.use(acl.authorize.unless({
      path: ['/v1/blogs']
    }));

    /**
     * Other routes we are protecting
     */

    ROUTER.route('/users')
      .post(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .get(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .put(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .delete(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      });


    ROUTER.route('/blogs')
      .post(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .get(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .put(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      })
      .delete(function(req, res) {
        res.send({
          message: 'Access granted'
        });
      });
    /**
     * Now lets include our router to the main app
     */


    app.use('/v1', ROUTER);
  };
})();
