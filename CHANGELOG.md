## Change log
All notable changes to this project will be documented in this file.

##### Notable changes

- **Default acl file:** The default filename has been changed to `nacl.json` or `.yml` for uniqueness purposes. This is to prevent conflicts in case there already exits a `config.json` file in any already existing project.

- **Configuration file:** YAML is now accepted as a valid configuration syntax

- **Policy structure:** Each policy in the permissions now works based on its own action, this will facilitate in building policies with independent actions based on each scenario.

- **config method:** This method now accepts an object with five properties. We have separated the filename from path and added boolean yml as a configuration file selector.

  ```js

  acl.config({
    // The name of the acl rules file
    filename:"foo.json",
     // Location or folder where the above filename is
    path:'config',
    // The prefix url before you resource e.g developer/v1/<my_recource>
    baseUrl:'developer/v1',
      // When set to true will use the yml parser to read acl rules, the filename should also change to foo.yml
    yml: false,
    // The encoding type you need fs to use to read yout config file
    // read nodejs fs module for more information https://nodejs.org/api/fs.html
    encoding: 'utf8'
  });

  ```
- **getRules method** This method is no longer supported.
