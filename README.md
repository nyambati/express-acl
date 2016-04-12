# express-acl
[![Build Status](https://travis-ci.org/andela-thomas/express-acl.svg?branch=master)](https://travis-ci.org/andela-thomas/express-acl)
[![Coverage Status](https://coveralls.io/repos/github/andela-thomas/express-acl/badge.svg?branch=develop)](https://coveralls.io/github/andela-thomas/express-acl?branch=develop)
[ ![Codeship Status for andela-thomas/express-acl](https://codeship.com/projects/ad5c8050-df39-0133-54e5-460ef9277ccd/status?branch=master)](https://codeship.com/projects/144965)

Express Access Control Lists (express-acl) enable you to manage access to your express routes and data.This is achieved through the ACL rules. ACL defines which user groups are granted access and the type of access they have against a specified resource. When a request is received against a resource, `express-acl` checks the corresponding ACL policy to verify the requester has the necessary access permissions.

##### What is ACL rules
ACL is a set of rules that tell `express-acl` how to handle traffic directed to your routes and resources. Think of them like road signs or traffic lights that control how your traffic flows in your app. ACL rules are defined in JSON format.

**Example**
``` json
[{
  "group": "user",
  "permissions": [{
    "resource": "users",
    "methods": [
      "POST",
      "GET",
      "PUT"
    ]
  }],
  "action": "allow"
}]

```
The contents of this file will be discussed in the usage section


## Installation
*Not implemented*

You can get download `express-acl` from NPM
```
  $ npm install express-acl

```

then in your project require express-acl

``` js

  var acl =  require('express-acl');

```

 or GitHub

 ```
  $ git clone https://github.com/andela-thomas/express-acl.git

  ```
copy the lib folder to your project and then require `nacl.js`

``` js

  var acl =  require('./lib/nacl');

```

# Usage

Express acl is use the configuration approach to control routes traffic in your application.

1. #### Configuration ` config.json`
  First step is to create a file called `config.json` and place this in the root folder. This is the file where we will define the roles that can access our application, and the policies that restrict or give access to certain resources. Take a look at the example below.

  ```json

  [{
    "group": "admin",
    "permissions": [{
      "resource": "*",
      "methods": "*"
    }],
    "action": "allow"
  }, {
    "group": "user",
    "permissions": [{
      "resource": "users",
      "methods": [
        "POST",
        "GET",
        "PUT"
      ]
    }],
    "action": "deny"
  }]
```

  In the example above we have defined an ACL with two policies which define roles of `user` and `admin`. A valid ACL should be an Array of objects(policies). The properties of the policies are explained below.

    Property | Type | Description
    --- | --- | ---
    **group** | `string` | This property defines the access group to which a user can belong to  e.g `user`, `guest`, `admin`, `trainer`. This may vary depending with the architecture of you application.
    **permissions** | `Array` | This property contains an array of objects that define the resources exposed to a group and the methods allowed/denied
    **resource** | `string` | This is the resource that we are either giving access to. e.g `blogs` for route `/api/blogs`, `users` for route `/api/users`. You can also specify a glob `*` for all resource/routes in your application(recommended for admin users only)
    **methods** | `string or Array` | This are http methods that a user is allowed or denied from executing. `["POST", "GET", "PUT"]`. use glob `*` if you want to include all http methods.
    **action** | `string` | This property tell express-acl what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic on route `/api/users` for methods `GET, PUT, POST` are denied, but the rest allowed. And for the admin, all traffic for all resource is allowed.

  #### How to write ACL rules
  ACLs define the way requests will be handled by express acl, therefore its important to ensure that they are well designed to maximise efficiency. For more details follow this [link](https://github.com/andela-thomas/express-acl/wiki/How-to-write-effective-ACL-rules)
