# Fetchr Plugin API

## Constructor(options)

Creates a new `fetchr` plugin instance with the following parameters:

 * `options`: An object containing the plugin settings
 * `options.corsPath` (optional): Base CORS path in case CORS is enabled
 * `options.xhrPath='/api'` (optional): Stores your xhr path prefix used by client side requests.
 * `options.xhrTimeout=3000` (optional): Timeout in milliseconds for all XHR requests (can be overridden per request).
 * `options.statsCollector` (optional): This function will be invoked for each fetcher request with two arguments:
    * **actionContext:**  This is the [action context](https://github.com/yahoo/fluxible/blob/main/packages/fluxible/docs/api/Actions.md#action-context) object provided by [Fluxible](http://fluxible.io/).
    * **stats:**  This object contains all stats data for each service CRUD request. [See Fetchr docs for more info about provided stats data fields.](https://github.com/yahoo/fetchr/blob/master/README.md#stats-monitoring--analysis)

## Instance Methods

### getXhrPath

getter for the `xhrPath` option passed into the constructor.

```js
var pluginInstance = fetchrPlugin({
    xhrPath: '/api'
});

pluginInstance.getXhrPath(); // returns '/api'
```

### registerService(service)

[register a service](../README.md#registering-your-services) with fetchr.  For server side only.

### getMiddleware

getter for fetchr's express/connect middleware.  For server side only.  See [usage](../README.md#exposing-your-services)

## actionContext Methods

 * `actionContext.service.read(resource, params, [config,] callback)`: Call the read method of a service. See [fetchr docs](https://github.com/yahoo/fetchr) for more information.
 * `actionContext.service.create(resource, params, body, [config,] callback)`: Call the create method of a service. See [fetchr docs](https://github.com/yahoo/fetchr) for more information.
 * `actionContext.service.update(resource, params, body, [config,] callback)`: Call the update method of a service. See [fetchr docs](https://github.com/yahoo/fetchr) for more information.
 * `actionContext.service.delete(resource, params, [config,] callback)`: Call the delete method of a service. See [fetchr docs](https://github.com/yahoo/fetchr) for more information.
 * `actionContext.service.updateOptions(options)`: Update the options of the fetchr instance. See [fetchr docs](https://github.com/yahoo/fetchr) for more information.
 * `actionContext.getServiceMeta()`: The plugin will collect metadata for service responses and provide access to it via this method. This will return an array of metadata objects.
