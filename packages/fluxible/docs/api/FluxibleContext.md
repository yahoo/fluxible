# API: `FluxibleContext`

Instantiated once per request/session by calling `Fluxible.createContext(options)`, this container provides isolation of stores, dispatches, and other data so that it is not shared between requests on the server side.

## SubContexts

Within a `FluxibleContext`, each component of your application receives a subset of the methods within the `FluxibleContext`. This prevents the components from breaking out of the Flux flow. These subcontexts are modifiable by [plugins](Plugins.md). Each subcontext has a corresponding getter on the `FluxibleContext`, for instance `getComponentContext()`, although for the most part, they will be provided to you within your components without needing to call the getter.

 * [Action Context](Actions.md#action-context) - Passed as first parameter to all actions. Has access to most methods within Fluxible.
 * [Component Context](Components.md#component-context) - Passed as a prop to top level React component and then propagated to child components that require access to it.
 * [Store Context](Stores.md#store-context) - Passed as first parameter to all store constructors. By default has no methods or properties.

|               	| FluxibleContext 	| Action Context 	| Component Context 	| Store Context 	|
|---------------	|-----------------	|----------------	|-------------------	|---------------	|
| dispatch      	|                 	|        ✓       	|                   	|               	|
| executeAction 	|        ✓        	|        ✓       	|    no callback    	|               	|
| getStore      	|        ✓        	|        ✓       	|         ✓         	|         &nbsp;	|

## Methods

### Constructor

Creates a new context instance with the following parameters:

 * `options`: An object containing the context settings
 * `options.app`: Provides access to the application level functions and settings
 * `options.optimizePromiseCallback`: Whether to optimize Promise callback. Defaults to `false`. `FluxibleContext` uses two setImmediate in [utils/callAction](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/utils/callAction.js) when executing every action.  The second `setImmediate` wraps callback execution to make sure exceptions thrown during callback execution are not swallowed by Promise. This optimization eliminates the second `setImmediate` by catching errors caught by Promise and throwing it. This way, successful callback executions won't need this extra yielding because of the `setImmediate`.

### executeAction(action, payload, [done])

This is the entry point into an application's execution. The initial action is what begins the flux flow: action dispatches events to stores and stores update their data structures. On the server, we wait for the initial action to finish and then we're ready to render using React. On the client, the components are already rendered and are waiting for store change events.

Parameters:

 * `action`: A function that takes three parameters: `actionContext`, `payload`, `done`
 * `payload`: the action payload
 * `done`: optional callback to call when the action has been completed. Receives error as the first parameter and result as the second.

Returns:

* `executeActionPromise`: promise that is resolved once the action is completed, or rejected if it has an error

**Callback**

 ```js
 let action = function (actionContext, payload, done) {
     // do stuff
     done();
 };
 context.executeAction(action, {}, function (err) {
     // action has completed
 });
 ```

**Promise**

 ```js
 var action = function (actionContext, payload, done) {
     // do stuff
     done();
 };
 context.executeAction(action, {})
     .then(function (result) {
         // action has completed
     })
     .catch(function (err) {
         // action had an error
     });
 ```

### plug(plugin)

Allows custom context settings to be shared between server and client. Also allows dynamically plugging the ActionContext, ComponentContext, and StoreContext to provide additional methods.

### getActionContext()

Returns the [Action Context](Actions.md#action-context) which provides access to only the functions that should be called from actions. By default: `dispatch`, `executeAction`, and `getStore`.

This action context object is used every time an `executeAction` method is called and is passed as the first parameter to the action.

### getComponentContext()

Returns the [Component Context](Components.md#Component Context) which provides access to only the functions that should be called from components. By default: `executeAction`, `getStore`. `executeAction` does not allow passing a callback from components so that it enforces actions to be send and forget.

*Note: You may provide an app level `componentActionErrorHandler` function when instantiating Fluxible. This allows you to catch errors (at a high level) spawning from components firing actions.*

This context interface should be passed in to your top level React component and then sent down to children as needed. These components will now have access to listen to store instances, execute actions, and access any methods added to the component context by plugins.

### getStoreContext()

Returns the [Store Context](Stores.md#Store Context) which provides access to only the functions that should be called from stores. By default, this is empty, but it is modifiable by plugins.

### dehydrate()

Returns a serializable object containing the state of the `FluxibleContext` and its `Dispatchr` instance. This is useful for serializing the state of the current context to send it to the client. This will also call any plugins whose `plugContext` method returns an object containing a dehydrate method.

### rehydrate(state)

Takes an object representing the state of the `FluxibleContext` and `Dispatchr` instances (usually retrieved from dehydrate) to rehydrate them to the same state as they were on the server. This will also call any plugins whose `plugContext` method returns an object containing a rehydrate method.
