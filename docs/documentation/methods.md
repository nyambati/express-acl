# Api Methods

## authorize
    [type: middleware]

This is the middleware that manages your application requests based on the role and acl rules.

```js
app.get(acl.authorize);

```

## unless
    [type:function, params: function or object]

By default any route that has no defined policy against it is blocked, this means you cannot access this route untill you specify a policy.
This method enables you to exclude unprotected routes. This method uses express-unless package to achive this functionality.
For more details on its usage follow this link [express-unless](https://github.com/jfromaniello/express-unless/blob/master/README.md)

```js
//assuming we want to hide /auth/google from express acl

app.use(acl.authorize.unless({path:['/auth/google']}));

```

Anytime that this route is visited, unless method will exlude it from being passed though our middleware.

!!! note
    You don't have to install express-unless it has already been included into the project.
