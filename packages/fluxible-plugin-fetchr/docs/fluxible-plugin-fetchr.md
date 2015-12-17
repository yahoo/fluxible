# Fetchr Plugin API

## Constructor(options)

Creates a new `fetchr` plugin instance with the following parameters:

 * `options`: An object containing the plugin settings
 * `options.xhrPath` (optional): Stores your xhr path prefix used by client side requests. DEFAULT: '/api'
 * `options.corsPath` (optional): Base CORS path in case CORS is enabled

## Instance Methods

### getXhrPath

getter for the `xhrPath` option passed into the constructor.

```
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
