## Status codes and responses

Express acl return  status codes and responses when authorization fails. In this section We will look into these codes and scenarios that might trigger such responses.

When Authorization fails,this module returns a json response with the following properties.

- status
- success
- Message

## Missing role

Express acl uses user's role to match the approriate policy to use. Therefore it is required that each use object to have a role defined. However if the user role is not defined, Express acl will deny that user access to the system.

```json
{
  "status": "Access Denied",
  "success": false,
  "message":"REQUIRED: Role not found"
}

```
This error will also return a status of `404`

## Missing Group
Policies are defined under user groups. This enables us to group users using roles and define policies through groups insted of doing it per user. If a user group is not defined this means that users of that role will not be gived access to the system. Therefore if you have a role associated to users, ensure that such role has been defined in your rules configurations.

```json
{
  "status": "Access Denied",
  "success": false,
  "message":"REQUIRED: Role not found"
}

```

This error will also return a status of `404`.

## Unauthorized access.
When a user is trying to access a resource that they are not allowed access to, Express acl will deny access to that a resource and send status of `403` with JSON response as follows.

```json
{
  "status": "Access Denied",
  "success": false,
  "message":"Unauthorized access"
}
```

