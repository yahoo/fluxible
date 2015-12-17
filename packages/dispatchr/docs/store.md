# Store API

We have provided [utilities for creating stores](#helper-utilities) but you are not required to use these if you want to keep your stores completely decoupled from the dispatcher. Dispatchr only expects that your stores use the following interface:

## Constructor

The store should have a constructor function that will be used to instantiate your store using `new Store(dispatcherInterface)` where the parameters are as follows:

  * `dispatcherInterface`: An object providing access to dispatcher's waitFor and getStore functions
  * `dispatcherInterface.getContext()`: Retrieve the context object that was passed
  * `dispatcherInterface.getStore(storeClass)`
  * `dispatcherInterface.waitFor(storeClass[], callback)`

  The constructor is also where the initial state of the store should be initialized.

```js
function ExampleStore(dispatcher) {
    this.dispatcher = dispatcher;
    if (this.initialize) {
        this.initialize();
    }
}
```

It is also recommended to extend an event emitter so that your store can emit `change` events to the components.

```js
util.inherits(ExampleStore, EventEmitter);
```

## Static Properties

### storeName

The store should define a static property that gives the name of the store. This is used internally and for debugging purposes.

```js
ExampleStore.storeName = 'ExampleStore';
```

### handlers

The store should define a static property that maps action names to handler functions or method names. These functions will be called in the event that an action has been dispatched by the Dispatchr instance.

```js
ExampleStore.handlers = {
    'NAVIGATE': 'handleNavigate',
    'default': 'defaultHandler' // Called for any action that has not been otherwise handled
};
```

The handler function will be passed two parameters:

  * `payload`: An object containing action information.
  * `actionName`: The name of the action. This is primarily useful when using the `default` handler

```js
ExampleStore.prototype.handleNavigate = function (payload, actionName) {
    this.navigating = true;
    this.emit('change'); // Component may be listening for changes to state
};
```

If you prefer to define private methods for handling actions, you can use a static function instead of a method name. This function will be bound to the store instance when it is called:

```js
ExampleStore.handlers = {
    'NAVIGATE': function handleNavigate(payload, actionName) {
        // bound to store instance
        this.navigating = true;
        this.emit('change');
    }
};
```

## Instance Methods

### dehydrate()

The store should define this function to dehydrate the store if it will be shared between server and client. It should return a serializable data object that will be passed to the client.

```js
ExampleStore.prototype.dehydrate = function () {
    return {
        navigating: this.navigating
    };
};
```

### rehydrate(state)

The store should define this function to rehydrate the store if it will be shared between server and client. It should restore the store to the original state using the passed `state`.

```js
ExampleStore.prototype.rehydrate = function (state) {
    this.navigating = state.navigating;
};
```

### shouldDehydrate()

The store can optionally define this function to control whether the store state should be dehydrated by the dispatcher. This method should return a boolean. If this function is undefined, the store will always be dehydrated (just as if true was returned from method).

```js
ExampleStore.prototype.shouldDehydrate = function () {
    return true;
}
```

## Helper Utilities

### BaseStore

A base class that you can extend to reduce boilerplate when creating stores.

```js
var BaseStore = require('fluxible/addons').BaseStore;
```

#### Built-In Methods

 * `emitChange()` - emits a 'change' event
 * `getContext()` - returns the [store context](FluxibleContext.md#store-context)
 * `addChangeListener(callback)` - simple method to add a change listener
 * `removeChangeListener(callback)` - removes a change listener
 * `shouldDehydrate()` - default implementation that returns true if a `change` event has been emitted

```js
var BaseStore = require('fluxible/addons').BaseStore;
var util = require('util');

function ApplicationStore(dispatcher) {
    BaseStore.apply(this, arguments);
    this.currentPageName = null;
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
    'RECEIVE_PAGE': 'handleReceivePage'
};

util.inherits(ApplicationStore, BaseStore);

ApplicationStore.prototype.handleReceivePage = function (payload) {
    this.currentPageName = payload.pageName;
    this.emitChange();
};

ApplicationStore.prototype.getCurrentPageName = function () {
    return this.currentPageName;
};

// For sending state to the client
ApplicationStore.prototype.dehydrate = function () {
    return {
        currentPageName: this.currentPageName
    };
};

// For rehydrating server state
ApplicationStore.prototype.rehydrate = function (state) {
    this.currentPageName = state.currentPageName;
};

module.exports = ApplicationStore;

```

### createStore

A helper method similar to `React.createClass` but for creating stores that extend `BaseStore`. Also supports mixins.

```js
var createStore = require('fluxible/addons').createStore;

module.exports = createStore({
    storeName: 'ApplicationStore',
    handlers: {
        'RECEIVE_PAGE': 'handleReceivePage'
    },
    handleReceivePage: function (payload) {
        this.currentPageName = payload.pageName;
        this.emitChange();
    },
    getCurrentPage: function () {
        return this.currentPageName;
    },
    dehydrate: function () {
        return {
            currentPageName: this.currentPageName
        };
    },
    rehydrate: function (state) {
        this.currentPageName = state.currentPageName;
    }
});

