# navigateAction

`navigateAction` is an action which will load a new route and update the URL of your application.  You can call this action directly to update the URL of your application.  It is also invoked indirectly when a user clicks on a [`NavLink`](./navlink.md).

`navigateAction` expects a `{method, url}` object as a payload, where `method` is the HTTP method used to retrieve the URL (e.g. 'get'.)

If no matching route is found, `navigateAction` will call the callback with an error where `err.status` is set to 404.

If a route is successfully matched, `navigateAction` will first dispatch a `NAVIGATE_START` event, with route data as the payload (see below).  `navigateAction` will then try to find an action associated with the route from the route config; this can either be an action function or the name of an action function (retrieved with `context.getAction(name)`.)  If an action is found, it is executed, with route data as the payload.  `navigateAction` finally will dispatch a `NAVIGATE_SUCCESS` event, or `NAVIGATE_FAILURE` event if the route's action returns an error.

## Route Data

`navigateAction` passes a route data structure as the payload for all events and as the payload for any called actions.  This consists of:

| Field Name | Description                             |
|------------|-----------------------------------------|
| name       | The name of the matched route.          |
| url        | The actual URL that was matched.        |
| params     | Parameters parsed from the route.       |
| query      | Query parameters parsed from the URL. Note that if a query parameter occurs multiple times, the value in this hash will be an array. |
| config     | The configuation for the route.         |
| navigate   | The payload passed to `navigateAction`. |
