# Overview

This are the options that are passed to the config method. This options determine how the rules will be loaded and how resource matching should start from.

The config method takes in an object with possible five parameters, They include

- filename: `String`
- path: `String`
- yml: `boolean`
- baseUrl: `String`
- rules: `Object`
- defaultRole: `String`
- decodedObjectName: `String`
- searchPath: `String`
- encoding: `String`
- baseUrl: `String`

## Filename

`filename: <String> [optional]`

This property holds the name of the file that contains the acl configurations. By default express-acl will look for `nacl.json` or `nacl.yml` in the root folder of your project. If you plan to change the name you can specify the name of your file in this property.

```javascript

  const options = {
    filename: 'anotherFile.json'
  };

  acl.config(options);

```

Its important to note that the filename should have an extension attached to it e.g `.json` or `.yml`.

## Path

`path: <String> [optional]`

This property specifies the location of the configuration file. By default the acl configuration file is located in the root folder of the project. However sometimes you may want to place this file among other configuration files of your project. You can achieve this by adding the location of the file relative to the root folder.

If the config folder is `/server/config`, then we can configure the path property as shown below.

```javascript
  const options = {
    filename: 'acl.json',
    path:'server/config'
  };

  acl.config(options);

```

Basically what this means is that, you are instructing express-acl to go to the `server/config` folder and load the contents of `acl.json`.

## File Type

`yml: <Boolean> [optional]`

Express acl supports two types of configuration syntax. `JSON` and `yml`. By default it uses JSON as its primary syntax, however you can change to whichever syntax that works for you.

This property is false by default therefore if you want to use `yml` as your syntax then change it to true. This will instruct express-acl to use a `YAML` parser instead of the `JSON` parser.

```js
  const options = {
    filename:'acl.yml',
    path:'server/config',
    yml:true
  };

  acl.config(options);

```

## Encoding

`encoding: <String> [optional]`

This is the encoding type `fs` module uses to read nacl file. For more information refer to the [file system ](https://nodejs.org/api/fs.html) Nodejs documentation.

## Base URL

`baseUrl: <String> [required]`

The base URL represent the prefix of your API. This can either be `api`,`v1`,`/developer/v1` etc. This is important because express-acl will use this url to map the location of the resources. Take an example of the following url `/api/users`.

In this URL our resource is users, and the base URL being `api`. If we do not specify the base URL express will treat `api` as our resource instead of `users`.

```js

const options = {
  filename:'acl.yml',
  path:'server/config',
  baseUrl:'api'
  yml:true
};

acl.config(options);

```

## Rules

`rules: <String> [optional]`

If you are not willing to use either json file or yml configuration you can pass the config method an array of rules. This can be rules saved in an external source such as database or a js file in your project.

```js
const arrayOfRules = [
  {
    group: "admin",
    permissions: [
      {
        resource: "*",
        methods: "*"
      }
    ],
    action: "allow"
  },
];


const options = {
  baseUrl:'api',
  rules: ArrayOfRules,
  yml:true
};

acl.config(options);

```

## Default Role

`defaultRole: <String> [optional]`

If You have a user in your system who has not been assigned a role, you can specify a role that will be assumed if such users exist. By the default this module will assign `guest` as a default role. You can override this by using `defaultRole` property.

```js

acl.config({
    yml: true,
    defaultRole: 'anonymous'
});

```

## Search Path And Decoded Object Name

This two properties enable you to customize how and where your user role will be located in the request object. By default this module looks for `req.decoded.role`, However this might be the case with everyone. if your decoded object uses different format you can specify using the above properties.

!!! note
    Both of these properties are use to locate the role in your request object, therefore  they cannot be used together.
    You can only use on of each in your configuration.

### Decoded Object Name

`decodedObjectName: <String> [optional]`

You can use this method to specify the name of the object holding your user object, this can be user, session, etc. The default value for this is `decoded`.

```js

acl.config({
    yml: true,
    decodedObjectName: 'user'
});

```

### Search Path

`searchPath: <String> [optional]`

In some cases your user object can have the role name nested deep into your object. With the above config this module will look for the role name in `user.role`. If your role is nested in `user.role.name` you can specify this path as a search path so that this module can be able to find your role.


```js

acl.config({
    yml: true,
    searchPath: 'user.role.name'
});

```
