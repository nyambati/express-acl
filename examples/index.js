var express = require('express'),
  bodyParser = require('body-parser'),
  routes = require('./routes'),
  app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


/*=============================================
  All our routes will go here
===============================================*/

routes(app, express);

app.get('*', function(req, res) {
  res.send({
    message: ' welcome to express acl testing'
  });
});


app.listen(3000, function() {
  console.log('express acl server running at port 3000');
});
