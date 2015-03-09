# FluxibleContext

Instantiated once per request/session, this provides isolation of data so that it is not shared between requests on the server side.

## Constructor

Creates a new context instance with the following parameters:

 * `options`: An object containing the context settings
 * `options.app`: Provides access to the application level functions and settings

## createElement(props)

Instantiates the app level React component (if provided in the constructor) with the given props with an additional `context` key containing a ComponentContext. This is the same as the following assuming Component is your top level React component:

```js
Component({
    context: context.getComponentContext();
});
```

## executeAction(action, payload, callback)

This is the entry point into an application's execution. The initial action is what begins the flux flow: action dispatches events to stores and stores update their data structures. On the server, we wait for the initial action to finish and then we're ready to render using React. On the client, the components are already rendered and are waiting for store change events.

Parameters:

 * `action`: A function that takes three parameters: `actionContext`, `payload`, `done`
 * `payload`: the action payload
 * `done`: the callback to call when the action has been completed

 ```js
 var action = function (actionContext, payload, done) {
     // do stuff
     done();
 };
 context.executeAction(action, {}, function (err) {
     // action has completed
 });
 ```

## plug(plugin)

Allows custom context settings to be shared between server and client. Also allows dynamically plugging the ActionContext, ComponentContext, and StoreContext to provide additional methods.

## getActionContext()

Generates a context interface providing access to only the functions that should be called from actions. By default: `dispatch`, `executeAction`, and `getStore`.

This action context object is used every time an `executeAction` method is called and is passed as the first parameter to the action.

## getComponentContext()

Generates a context interface providing access to only the functions that should be called from components. By default: `executeAction`, `getStore`. `executeAction` does not allow passing a callback from components so that it enforces actions to be send and forget.

Note: You may provide an app level `componentActionHandler` function when instantiating Fluxible. This allows you to catch errors (at a high level) spawning from components firing actions.

This context interface should be passed in to your top level React component and then sent down to children as needed. These components will now have access to listen to store instances, execute actions, and access any methods added to the component context by plugins.

## getStoreContext()

Generates a context interface providing access to only the functions that should be called from stores. By default, this is empty. See [store constructor interface](https://github.com/yahoo/dispatchr#constructor) for how to access this from stores.

## dehydrate()

Returns a serializable object containing the state of the FluxibleContext and its Dispatchr instance. This is useful for serializing the state of the current context to send it to the client. This will also call any plugins whose plugContext method returns an object containing a dehydrate method.

## rehydrate(state)

Takes an object representing the state of the FluxibleContext and Dispatchr instances (usually retrieved from dehydrate) to rehydrate them to the same state as they were on the server. This will also call any plugins whose plugContext method returns an object containing a rehydrate method.
