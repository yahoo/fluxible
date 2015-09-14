# Data Services

Data is organized into services. Services are where you define your CRUD operations for a specific resource. A resource is a unique string that identifies the data (e.g. 'user', 'photo', 'comment').

For example, your application might have a User Service which defines how to create, read, update and delete a user account.

[Fetchr](https://github.com/yahoo/fetchr) manages an application's services and provides an isomorphic interface for calling the services. Fetchr transparently changes how it calls the services based on environment: on the server, calls are made directly to the services, while on the client, calls are executed via XHR to a route that proxies to the individual services.

The service code that you write is always executed on the server, but can be accessed transparently from actions without any knowledge of whether it's on the server or client. Fetchr provides an appropriate abstraction so that you can fetch (CRUD) the data needed in your stores using the same exact syntax on server and client side.

## Using The Plugin

[fluxible-plugin-fetchr](https://github.com/yahoo/fluxible-plugin-fetchr) is how we will use Fetchr in our Fluxible applications.

```js
// app.js
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
let pluginInstance = fetchrPlugin({
    xhrPath: '/api' // Path for XHR to be served from
});
const app = new Fluxible();

app.plug(pluginInstance);
```


## Creating Your Services

All you need to do is create an object that contains a `name` property to uniquely identify the service and a `read` method request data.

```js
// UserService.js
export default {
    // Name is the resource. Required.
    name: 'user',
    // At least one of the CRUD methods is Required
    read: function(req, resource, params, config, callback) {
        var data = DATABASE.getUser(params.userId);
        callback(null, data);
    },
    // other methods
    // create: function(req, resource, params, body, config, callback) {},
    // update: function(req, resource, params, body, config, callback) {},
    // delete: function(req, resource, params, config, callback) {}
}
```


## Registering Your Services

```js
// server.js
import userService from 'services/UserService.js';
pluginInstance.registerService(userService);
```

Or if you need to do this from your application without direct access to the plugin:

```js
import userService from 'services/UserService.js';
app.getPlugin('FetchrPlugin').registerService(userService);
```


## Exposing Your Services

Fetchr also contains an express/connect middleware that can be used as your REST endpoint from the client.

```js
// server.js
const server = express();
server.use(pluginInstance.getXhrPath(), pluginInstance.getMiddleware());
```


## Accessing Your Services

To maintain the Flux unidirectional data flow, services are only accessible from action creators via the actionContext.

```js
// loaderUser.js
export default function loadUser(context, payload, done) {
    context.service.read('user', {}, {}, function (err, userInfo) {
        if (err || !userInfo) {
            context.dispatch('RECEIVE_USER_INFO_FAILURE', err);
        } else {
            context.dispatch('RECEIVE_USER_INFO_SUCCESS', userInfo);
        }
        done();
    });
}
```
