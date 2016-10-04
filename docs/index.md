![](/images/constable.jpg)

# Express Acl

This is NodeJs runtime module that Implements ACL for expressJS Application. Its is designed to provide configuration approach to ACL implemantation as saving you the nightmare of writing countless middlewares. It suppports JSON and YAML as the configuration syntax.

[Installation](/documentation/getting-started/#installation)

## Example usage

```javascript
  const express = require('express');
  const acl = require('express-acl');
  const app = express()

  // load acl configuration, from acl file
  // default filename is nacl.json or nacl.yml

  acl.config({
    baseUrl:'api',
  })

  // Call the acl authorize middleware
  app.use(acl.authorize);


```