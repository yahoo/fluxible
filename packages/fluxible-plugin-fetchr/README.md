# Fetchr Plugin for Fluxible

[![npm version](https://badge.fury.io/js/fluxible-plugin-fetchr.svg)](http://badge.fury.io/js/fluxible-plugin-fetchr)

Provides isomorphic RESTful service access to your [Fluxible](https://github.com/yahoo/fluxible) application using [fetchr](https://github.com/yahoo/fetchr).

## Usage

```js
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
const app = new Fluxible();

app.plug(fetchrPlugin({
    xhrPath: '/api' // Path for XHR to be served from
}));
```

Now, when calling the `createContext` method on the server, make sure to send in the request object and optionally pass an `xhrContext` which will be used as parameters for all XHR calls:

```js
app.createContext({
    req: req,
    xhrContext: { // Used as query params for all XHR calls
        lang: 'en-US', // make sure XHR calls receive the same lang as the initial request
        _csrf: 'a3fc2d' // CSRF token to validate on the server using your favorite library
    }
});
```

### Registering Your Services

*Registering fetchr services is done on the server side*.  Since the fetchr plugin is in control of the `fetchr` class, we expose this through the `registerService` method.

```js
pluginInstance.registerService(yourService);
```

Or if you need to do this from your application without direct access to the plugin

```js
app.getPlugin('FetchrPlugin').registerService(yourService);
```

For real examples, you can check out [the `server.js` file in our chat example](https://github.com/yahoo/fluxible/blob/master/examples/chat/server.js).

### Exposing Your Services

Fetchr also contains an express/connect middleware that can be used as your access point from the client.
Fetchr middleware expects that you're using the [`body-parser`](https://github.com/expressjs/body-parser) middleware (or an alternative middleware that populates `req.body`) before you use Fetchr middleware.

```js
const server = express();
// you need to use body parser middleware before `FetchrPlugin`
server.use(bodyParser.json());
server.use(pluginInstance.getXhrPath(), pluginInstance.getMiddleware());
```

For real examples, you can check out [the `server.js` file in our chat example](https://github.com/yahoo/fluxible/blob/master/examples/chat/server.js).

### Dynamic XHR Paths

The `fetchrPlugin` method can also be passed a `getXhrPath` function that returns the string for the `xhrPath`. This allows you to dynamically set the `xhrPath` based on the current context. For instance, if you're hosting multiple sites and want to serve XHR via a pattern route like `/:site/api`, you can do the following:

```js
app.plug(fetchrPlugin({
    getXhrPath: function (contextOptions) {
        // `contextOptions` is the object passed to `createContext` above
        return contextOptions.req.params.site + '/api';
    }
}));
```

## CORS Support

Fetchr provides [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) support by allowing you to pass the full origin host into `corsPath`.

For example:

```js
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
const app = new Fluxible();

app.plug(fetchrPlugin({
    corsPath: 'http://www.foo.com',
    xhrPath: '/fooProxy'
}));
```

[See Fetchr docs for more info](https://github.com/yahoo/fetchr/blob/master/README.md#cors-support)

## Context Variables

By Default, fetchr appends all context values to the xhr url as query params. `contextPicker` allows you to greater control over which context variables get sent as query params depending on the xhr method (GET or POST) [See Fetchr docs for more info](https://github.com/yahoo/fetchr/blob/master/README.md#context-variables)

## Stats Monitoring & Analysis

To collect fetcher service's success/failure/latency stats, you can configure `statsCollector` for `FetchrPlugin`.  The `statsCollector` function will be invoked with two arguments: `actionContext` and `stats`:

* **actionContext:**  This is the [action context](https://github.com/yahoo/fluxible/blob/main/packages/fluxible/docs/api/Actions.md#action-context) object provided by [Fluxible](http://fluxible.io/).
* **stats:**  This object contains all stats data for each service CRUD request. [See Fetchr docs for more info about provided stats data fields.](https://github.com/yahoo/fetchr/blob/master/README.md#stats-monitoring--analysis)

Example for how to configure `statsCollector`:

```js
import Fluxible from 'fluxible';
import fetchrPlugin from 'fluxible-plugin-fetchr';
const app = new Fluxible();

app.plug(fetchrPlugin({
    corsPath: 'http://www.foo.com',
    xhrPath: '/fooProxy',
    statsCollector: function (actionContext, stats) {
        // just console logging as a naive example.  there is a lot more you can do here,
        // like aggregating stats or filtering out stats you don't want to monitor
        console.log('Request for resource', stats.resource,
            'with', stats.operation,
            'returned statusCode:', stats.statusCode,
            ' within', stats.time, 'ms');
    }
}));
```

## API

- [fluxible-plugin-fetchr](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-plugin-fetchr/docs/fluxible-plugin-fetchr.md)

## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
