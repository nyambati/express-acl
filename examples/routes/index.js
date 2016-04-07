var jwt = require('jsonwebtoken');
var faker = require('faker');
var acl = require('../../');
acl.config();
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
    role: 'user'
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

  ROUTER.use(acl.authorize);

  /**
   * Other routes we are protecting
   */

  ROUTER.route('/user/:id')
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
   * Make sure that your app has the base url, e.g. /api/ or /v1
   * nacl will detect your resource based on this url.
   */
  app.use('/v1', ROUTER);
};
