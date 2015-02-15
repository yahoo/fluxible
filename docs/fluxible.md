# Fluxible

Instantiated once across all requests, this holds settings and interfaces that are used across all requests/sessions.

## Constructor

Creates a new application instance with the following parameters:

 * `options`: An object containing the application settings
 * `options.appComponent` (optional): Stores your top level React component for access using getAppComponent()

## createContext(contextOptions)

Creates a new FluxibleContext instance passing the `contextOptions` into the constructor. Also iterates over the plugins calling `plugContext` on the plugin if it exists in order to allow dynamic modification of the context.

## plug(plugin)

Allows custom application wide settings to be shared between server and client. Also allows dynamically plugging the FluxibleContext instance each time it is created by implementing a `plugContext` function that receives the context options.

## getPlugin(pluginName)

Provides access to get a plugged plugin by name.

## registerStore(store)

Passthrough to [dispatchr's registerStore function](https://github.com/yahoo/dispatchr#registerstorestoreclass)

## getAppComponent()

Provides access to the `options.appComponent` that was passed to the constructor. This is useful if you want to create the application in a file that is shared both server and client but then need to access the top level component in server and client specific files.

## dehydrate(context)

Returns a serializable object containing the state of the Fluxible and passed FluxibleContext instances. This is useful for serializing the state of the application to send it to the client. This will also call any plugins which contain a dehydrate method.

## rehydrate(state)

Takes an object representing the state of the Fluxible and FluxibleContext instances (usually retrieved from dehydrate) to rehydrate them to the same state as they were on the server. This will also call any plugins which contain a rehydrate method.
