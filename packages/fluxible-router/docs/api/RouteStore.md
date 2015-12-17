# API: `RouteStore`

The `RouteStore` maintains the routes and handles the route matching logic. The `RouteStore` listens for `NAVIGATE_START` and `RECEIVE_ROUTES` events.

When a `NAVIGATE_START` event is heard we attempt to match the route provided by the `payload.url`. If a match is made we update the `currentRoute` with the matched route. We also set the `currentNavigate` property to be the original `payload`. You typically access these properties via `getCurrentRoute()` and `getCurrentNavigate()`.

When a `RECEIVE_ROUTES` event is heard we merge the current routes (if any) with those found in the `payload` object. We then nullify the current router instance so it's re-created with the most up-to-date routes next time it's needed.

## Quick Start

```js
// configs/routes.js

module.exports = {
    home: {
        path: '/',
        method: 'get'
    },
    blog: {
        path: '/blog',
        method: 'get'
    }
};
```

```js
// app.js

var Fluxible = require('fluxible');
var RouteStore = require('fluxible-router').RouteStore;
var routes = require('./configs/routes');

var app = new Fluxible({
    component: require('./components/App.jsx')
});

var MyRouteStore = RouteStore.withStaticRoutes(routes);

app.registerStore(MyRouteStore);

module.exports = app;
```
