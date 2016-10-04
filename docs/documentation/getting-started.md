# Installation

Express Acl is available via NPM registry

```bash

$ npm install express-acl --save

```


# Configuration

Express acl uses acl rules to manage and protect your resources, They have to be loaded and configured before being used.

```js
  const acl = require('express-acl');

  // Call the config method and pass in the  options
  acl.config({
    baseUrl:'api',
    yml:true
  });

```

For more details check the [configuration options](/documentation/configuration) page

# Adding Rules

The config method loads the rules for the local file. By default this module will look for `nacl.json` file in the root folder of your project. This can be overidden by adding more options to the config method as we have added yml which will look for `nacl.yml` file instead.

```yaml
- group: user
  permissions:
    - resource: users
      methods:
        - GET
        - POST
        - DELETE
      action: allow
```

This file instructs this module on how to manage access to your resources. The contets of this file will be covered in details in the [Acl rules](/documentation/acl-rules) section


# Authentication
Express Acl depends on the `role` of each authenticated user to pick the corresponding ACL policy for each defined user groups. Therefore, You should always place the acl middleware after the authenticate middleware.

Below is an example of an Authenticatio middleware implementation using jsonwebtokens.

```javascript
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

```

# Authorize

The acl module provides a middleware `authorize`. This middleware should be placed after the authentication middleware. It will intercept all the requests made for all the resources and apply relevant policies ton these to either deny or allow access depending on the configuration.

```javascript

ROUTER.use(acl.authorize);

```

Once this middware is called, express-acl will pick the role from the authenticated user,and apply corresponding polices dependng on he role and resource sbeing requested for.


