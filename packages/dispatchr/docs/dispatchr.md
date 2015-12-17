# Dispatchr API

Dispatchr has one main function that is exported: `createDispatcher(options)`. This returns a new [`Dispatcher`](#dispatcher-api) instance. `createDispatcher` takes the following `options`:

 * `options.stores`: An array of stores to register automatically

## Dispatcher API

### registerStore(storeClass)

A static method to register stores to the dispatcher making them available to handle actions and be accessible through `getStore` on the dispatcher context.

### createContext(contextOptions)

Creates a new dispatcher [context](#context-api) that isolates stores and dispatches with the following parameters:

 * `contextOptions`: A context object that will be made available to all stores. Useful for request or session level settings.

## Context API

### dispatch(actionName, payload)

Dispatches an action, in turn calling all stores that have registered to handle this action.

 * `actionName`: The name of the action to handle (should map to store action handlers)
 * `payload`: An object containing action information.

#### getStore(storeClass)

Retrieve a store instance by class. Allows access to stores from components or stores from other stores.

```js
var MessageStore = require('./stores/MessageStore');
dispatcher.getStore(MessageStore);
```

#### waitFor(storeClasses, callback)

Waits for another store's handler to finish before calling the callback. This is useful from within stores if they need to wait for other stores to finish first.

  * `storeClasses`: An array of store classes to wait for
  * `callback`: Called after all stores have fully handled the action

#### dehydrate()

Returns a serializable object containing the state of the dispatcher context as well as all stores that have been used since instantiation. This is useful for serializing the state of the application to send it to the client.

#### rehydrate(dispatcherState)

Takes an object representing the state of the dispatcher context (usually retrieved from dehydrate) to rehydrate the instance as well as the store instance state.

