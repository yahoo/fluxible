# API: `RouteStore`

The `RouteStore` maintains the routes and handles the route matching logic. The `RouteStore` listens for `NAVIGATE_START`, `NAVIGATE_SUCCESS`, `NAVIGATE_FAILURE`, `RECEIVE_ROUTES`, and `RESET_ROUTES` events.

When a `NAVIGATE_START` event is heard we attempt to match the route provided by the `payload.url`. If a match is made we update the `currentRoute` with the matched route. We also set the `currentNavigate` property to be the original `payload`. You typically access these properties via `getCurrentRoute()` and `getCurrentNavigate()`. In addition, the previous navigation object will be saved in the store, which contains information about the route before this navigation. The previous navigate object is accessible through `getPrevNavigate()`.

When a `RECEIVE_ROUTES` event is heard we merge the current routes (if any) with those found in the `payload` object. We then nullify the current router instance so it's re-created with the most up-to-date routes next time it's needed.

Note that if multiple `RECEIVE_ROUTES` events are received, the event payloads of these events are merged together in the receiving order.  This could make it hard to delete routes.  If needed, you can also dispatch a `RESET_ROUTES` event, which will completely overwrite the routes with the event payload.  Similar to `RECEIVE_ROUTES`, we will nullify the current router instance so it's re-created with the most up-to-date routes next time it's needed.

## Quick Start

```js
// configs/routes.js

const routes = {
    home: {
        path: '/',
        method: 'get'
    },
    blog: {
        path: '/blog',
        method: 'get'
    }
}

export default routes;
```

```js
// app.js

import Fluxible from 'fluxible';
import { RouteStore } from 'fluxible-router';
import routes from './configs/routes';
import App from './components/App.jsx';

const app = new Fluxible({
    component: App
});

const MyRouteStore = RouteStore.withStaticRoutes(routes);

app.registerStore(MyRouteStore);

export default app;
```
