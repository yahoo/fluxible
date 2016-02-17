# API: `navigateAction`

The `navigateAction` is a Fluxible action that dispatches `NAVIGATE_*` events that the [`RouteStore`](RouteStore.md) handles.

`navigateAction` will load a new route and update the URL of your application. You can call this action directly to update the URL of your application. It is also invoked indirectly when a user clicks on a [`NavLink`](NavLink.md).

`navigateAction` expects a `{method, url}` object as a payload, where `method` is the HTTP method used to retrieve the URL (e.g. 'get'.). It also can accept a `{method, routeName, params}`, if you want to let the router do the url composing.

If no matching route is found, `navigateAction` will call the callback with an error where `err.statusCode` is set to 404.

If a route is successfully matched, `navigateAction` will first dispatch a `NAVIGATE_START` event, with route data as the payload (see below). `navigateAction` will then try to find an action associated with the route from the route config; this can either be an action function or the name of an action function (retrieved with `context.getAction(name)`.) If an action is found, it is executed, with route data as the payload. `navigateAction` finally will dispatch a `NAVIGATE_SUCCESS` event, or `NAVIGATE_FAILURE` event if the route's action returns an error.

## Route Data

`navigateAction` passes a route object as the payload for all events and as the payload for any called actions. This consists of:

| Field Name | Description                             |
|------------|-----------------------------------------|
| name       | The name of the matched route.          |
| url        | The actual URL that was matched.        |
| routeName  | Not used if `url` is specified. This is the name of the target route, which should be defined in your app's routes. |
| params     | Parameters parsed from the route. If `url` prop is not available, `params` object will be used together with `routeName` to generate the href for the link. |
| query      | Query parameters parsed from the URL. Note that if a query parameter occurs multiple times, the value in this hash will be an array. |
| config     | The configuration for the route.         |
| navigate   | The payload passed to `navigateAction`. |
| type       | A value of `replacestate` will enable the replaceState functionality of the History API instead of `pushState`. |
