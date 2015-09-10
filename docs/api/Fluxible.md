# API: `Fluxible`

Instantiated once for your application, this holds settings and interfaces that are used across all requests.

## Usage

```js
import Fluxible from 'fluxible';
let fluxibleApp = new Fluxible({
    component: require('./components/App.jsx')
})
```

For each request:

```js
let context = fluxibleApp.createContext();
context.executeAction(action, payload, function () {
    let markup = React.renderToString(context.createElement());
    let state = fluxibleApp.dehydrate(context);

    // ... send markup and state to the client ...
});
```

## Methods

### Constructor

Creates a new application instance with the following parameters:

 * `options`: An object containing the application settings
 * `options.component` (optional): Stores your top level React component for access using `getComponent()`
 * `options.componentActionErrorHandler` (optional): App level component action handler.

### createContext(contextOptions)

Creates a new [FluxibleContext](FluxibleContext.md) instance passing the `contextOptions` into the constructor. Also iterates over the plugins calling `plugContext` on the plugin if it exists in order to allow dynamic modification of the context.

## registerStore(storeClass)

Registers a [store](Stores.md) to the application making them available to handle actions and be accessible through `getStore` on the [FluxibleContext](FluxibleContext.md).

### plug(plugin)

Allows custom application wide settings to be shared between server and client. Also allows dynamically plugging the [FluxibleContext](FluxibleContext.md) instance each time it is created by implementing a `plugContext` function that receives the context options.

### getPlugin(pluginName)

Provides access to get a plugged plugin by name.

### getComponent()

Provides access to the `options.component` that was passed to the constructor. This is useful if you want to create the application in a file that is shared both server and client but then need to access the top level component in server and client specific files.

### dehydrate(context)

Returns a serializable object containing the state of the Fluxible and passed FluxibleContext instances. This is useful for serializing the state of the application to send it to the client. This will also call any plugins which contain a dehydrate method.

### rehydrate(state, callback)

Takes an object representing the state of the Fluxible and FluxibleContext instances (usually retrieved from dehydrate) to rehydrate them to the same state as they were on the server. This will also call any plugins which contain a rehydrate method. This method is asynchronous to allow for plugins to load necessary assets or data needed for bootstrapping the application. The callback receives the following:

 * `err` - If rehydration had an error
 * `context` - A newly created context that is rehydrated to the server state
