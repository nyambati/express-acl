# Overview
This are the options that are passed to the config method. This options determin how the rules will be loaded and how resource matching should start from.

# Options

  The config method takes in an object with possible five parameters, They include

  * filename: `string`
  * path: `string`
  * yml: `boolean`
  * encoding: `string`
  * baseUrl: `string`

## Filename `filename [optional]`
This property holds the name of the file that contains the acl configurations. By default express-acl will look for `nacl.json` or `nacl.yml` in the root folder of your project. If you plan to change the name you can specify the name of your file in this property.

```javascript

  const options = {
    filename: 'anotherFile.json'
  };

  acl.config(options);

```
Its important to note that the filename should have an extension attached to it e.g `.json` or `.yml`.

## Path `path [optional]`
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

## File Type `yml [optional]`.

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


## Encoding `encoding [optional]`.
This is the encoding type `fs` module uses to read nacl file. For more information refer to the [file system ](https://nodejs.org/api/fs.html) Nodejs documentation.

## Base URL `baseUrl [required]`.

The base URL represent the prefix of your API. This can either be `api`,`v1`,`/developer/v1` etc. This is important because express-acl will use this url to map the location of the resources. Take an example of the following url `/api/users`.

In this URL our resource is users,and the base URL being `api`. If we donot specify the base URL express will treat `api` as our resource instead of `users`.

```js
  const options = {
    filename:'acl.yml',
    path:'server/config',
    baseUrl:'api'
    yml:true
  };

  acl.config(options);

```

