# API: `Stores`

Flux stores are where you keep your application's state and handle business 
logic that reacts to data events. Stores in Fluxible are just classes that 
adhere to a simple interface. Because we want stores to be able to be completely 
decoupled from Fluxible, we do not provide any store implementation in our 
default exports, however you can use the [helper utilities](#helper-utilities) 
for creating your stores.

```js
import {EventEmitter} from 'events';

class ApplicationStore extends EventEmitter {
    constructor (dispatcher) {
        super(dispatcher);
        this.dispatcher = dispatcher; // Provides access to waitFor and getStore methods
        this.currentPageName = null;
    }

    handleReceivePage (payload) {
        this.currentPageName = payload.pageName;
        this.emit('change');
    }

    getCurrentPageName () {
        return this.currentPageName;
    }

    // For sending state to the client
    dehydrate () {
        return this.getState();
    }

    // For rehydrating server state
    rehydrate (state) {
        this.currentPageName = state.currentPageName;
    }
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
    'RECEIVE_PAGE': 'handleReceivePage'
};

export default ApplicationStore;
```

## Helper Utilities

Fluxible provides a couple of helpers for building stores with some default
behavior and convenience methods.

 * [BaseStore](addons/BaseStore.md) - Store class that can be extended
 * [createStore](addons/createStore.md) - function for creating a class that 
extends `BaseStore`

## Interface

### Constructor

The store should have a constructor function that will be used to instantiate 
your store using `new Store(dispatcher)` where the parameters are as 
follows:

  * `dispatcher`: An object providing access to the following methods:
    * `dispatcher.getContext()`: Retrieve the [store context](#store-context)
    * `dispatcher.getStore(storeClass)`
    * `dispatcher.waitFor(storeClass[], callback)`

The constructor is also where the initial state of the store should be set.

```js
class ExampleStore {
    constructor (dispatcher) {
        this.dispatcher = dispatcher;
        if (this.initialize) {
            this.initialize();
        }
    }
}
```

### Notifying clients of changes and subscribing to a store

A fluxible store must implement the `EventEmitter` interface and use it to `.emit('change')` whenever the store contents change. Clients can subscribe to updates to the store by adding a listener using `on('change', handler)`.

```js
class ExampleStore extends EventEmitter {
    // ...
}
```

### Static Properties

#### storeName

The store should define a static property that gives the name of the store. This 
is used internally and for debugging purposes.

```js
ExampleStore.storeName = 'ExampleStore';
```

#### handlers

The store should define a static property that maps action names to handler 
functions or method names. These functions will be called in the event that an 
action has been dispatched by the Dispatchr instance.

```js
ExampleStore.handlers = {
    'NAVIGATE': 'handleNavigate',
    'default': 'defaultHandler' // Called for any action that has not been otherwise handled
};
```

The handler function will be passed two parameters:

  * `payload`: An object containing action information.
  * `actionName`: The name of the action. This is primarily useful when using 
the `default` handler

```js
class ExampleStore {
    handleNavigate (payload, actionName) {
        this.navigating = true;
        this.emit('change'); // Component may be listening for changes to state
    }
}
```

If you prefer to define private methods for handling actions, you can use a 
static function instead of a method name. This function will be bound to the 
store instance when it is called:

```js
ExampleStore.handlers = {
    'NAVIGATE': function handleNavigate(payload, actionName) {
        // bound to store instance
        this.navigating = true;
        this.emit('change');
    }
};
```

### Instance Methods

#### dehydrate()

The store should define this function to dehydrate the store if it will be 
shared between server and client. It should return a serializable data object 
that will be passed to the client.

```js
class ExampleStore {
    dehydrate () {
        return {
            navigating: this.navigating
        };
    }
}
```

#### rehydrate(state)

The store should define this function to rehydrate the store if it will be 
shared between server and client. It should restore the store to the original 
state using the passed `state`.

```js
class ExampleStore {
    rehydrate (state) {
        this.navigating = state.navigating;
    }
}
```

#### shouldDehydrate()

The store can optionally define this function to control whether the store state 
should be dehydrated by the dispatcher. This method should return a boolean. If 
this function is undefined, the store will always be dehydrated (just as if true 
was returned from method).

```js
class ExampleStore {
    shouldDehydrate () {
        return true;
    }
}
```

## Store Context

The store context by default contains no methods, but can be modified by 
plugins.
