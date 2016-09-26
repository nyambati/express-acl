# ACL Rules

Express acl uses Rules to define what access should be given to certain user groups over specific resources.

The first step to making acl rules is by creating nacl.json or nacl.yml depending on the syntax you prefer to use. Below is an example of ACL rules using both syntax.

JSON syntax
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
    ],
    "action": "deny"
  }]
}]
```

YAML syntax
```yml
- group: admin
  permissions:
    - resource: *
      methods: *
      action: allow

- group: user
  permissions:
    - resource: users
      methods:
        - GET
        - POST
        - DELETE
      action: deny
```

## Understanding ACL rules
Its important to Understand each property that consitute an acl. Below is a table that has a Description of each property.

Property | Type | Description
    --- | --- | ---
    **group** | `string` | This property defines the access group to which a user can belong to  e.g `user`, `guest`, `admin`, `trainer`. This may vary depending with the architecture of your application.
    **permissions** | `Array` | This property contains an array of objects that define the resources exposed to a group and the methods allowed/denied
    **resource** | `string` | This is the resource that we are either giving access to. e.g `blogs` for route `/api/blogs`, `users` for route `/api/users`. You can also specify a glob `*` for all resource/routes in your application(recommended for admin users only)
    **methods** | `string or Array` | This are http methods that a user is allowed or denied from executing. `["POST", "GET", "PUT"]`. use glob `*` if you want to include all http methods.
    **action** | `string` | This property tell express-acl what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic on route `/api/users` for methods `GET, PUT, POST` are denied, but the rest allowed. And for the admin, all traffic for all resource is allowed.

## How to write effective ACL Rules

ACLs define the way requests will be handled by express acl, therefore its important to ensure that they are well designed to maximise efficiency.In this section we are going to look at how to design a good ACL based on your application needs.

Assuming you have a blog application, and you want to make blogs read only, deny user ability to delete their own account. You want the admin to have all the access on resources.

**solution:**

```
admin:
  resource: all
  methods: all
  action: allow

user:
  resource: users
  methods:
    - DELETE
  action: deny

  resource: blogs
  methods:
    - GET
  action: allow

```

**Explanation**

The admin group has access to all resource and can perform all operation on any resource. Therefore, we need to allow all resources and methods. However, the user group is allowed to only read the blogs, create, read and update their own user profiles.

You may ask, why did we apply deny action on DELETE method instead of allowing other HTTP methods? In express-acl when you allow one method, you automatically deny access to the other methods and when you deny one you allow the remaining methods.

Thus denying one method is faster than allowing three or four methods. When it comes to blogs we only need them to read therefore we allow GET methods which means the other methods are denied.

For you to formulate good ACL rules, you need to understand the princple of negation. To allow is to deny and to deny is to allow, confusing right? how can you deny and allow at the same time?. Lets look at this example, if I have 4 methods POST, GET, PUT, DELETE and I deny POST. This is same as saying allow GET,PUT,DELETE and if I allow POST is same as saying deny GET,PUT,DELETE.

Now that we have established that lets write our config file. Our nacl.json will look like this.

```json
[{
   "group": "admin",
   "permissions": [{
     "resource": "*",
     "methods": "*",
     "action": "allow"
   }]
 },
 {
   "group": "user",
   "permissions": [
   {
     "resource": "users",
     "methods": [
       "DELETE",
     ],
    "action":"deny"
   },
   {
     "resource": "users",
     "methods": [
       "GET",
     ],
    "action": "allow"
   }]
 }]
```
