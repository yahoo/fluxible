# Dispatchr 

[![npm version](https://badge.fury.io/js/dispatchr.svg)](http://badge.fury.io/js/dispatchr)

A [Flux][] dispatcher for applications that run on the server and the client.

## Usage

For a more detailed example, see our [example applications](../../examples).

```js
var ExampleStore = require('./stores/ExampleStore.js');
var dispatcher = require('dispatchr').createDispatcher({
    stores: [ExampleStore]
});

var contextOptions = {};
var dispatcherContext = dispatcher.createContext(contextOptions);

dispatcherContext.dispatch('NAVIGATE', {});
// Action has been handled fully
```

## Differences from [Facebook's Flux Dispatcher](https://github.com/facebook/flux/blob/master/src/Dispatcher.js)

Dispatchr's main goal is to facilitate server-side rendering of Flux 
applications while also working on the client-side to encourage code reuse. In 
order to isolate stores between requests on the server-side, we have opted to 
instantiate the dispatcher and stores classes per request.

In addition, action registration is done by stores as a unit rather than 
individual callbacks. This allows us to lazily instantiate stores as the events 
that they handle are dispatched. Since instantiation of stores is handled by the 
dispatcher, we can keep track of the stores that were used during a request and 
dehydrate their state to the client when the server has completed its execution.

Lastly, we are able to enforce the Flux flow by restricting access to the 
dispatcher from stores. Instead of stores directly requiring a singleton 
dispatcher, we pass a dispatcher interface to the constructor of the stores to 
provide access to only the functions that should be available to it: `waitFor` 
and `getStore`. This prevents the stores from dispatching an entirely new 
action, which should only be done by action creators to enforce the 
unidirectional flow that is Flux.

## Helper Utilities

These utilities make creating stores less verbose and provide some `change` 
related functions that are common amongst all store implementations. These 
store helpers also implement a basic `shouldDehydrate` function that returns 
true if `emitChange` has been called by the store and false otherwise.

### BaseStore

`require('dispatchr/addons/BaseStore')` provides a base store class for 
extending. Provides `getContext`, `emitChange`, `addChangeListener`, and 
`removeChangeListener` functions. Example:

```js
var inherits = require('inherits');
var BaseStore = require('dispatchr/addons/BaseStore');
var MyStore = function (dispatcherInterface) {
    BaseStore.apply(this, arguments);
};
inherits(MyStore, BaseStore);
MyStore.storeName = 'MyStore';
MyStore.handlers = {
    'NAVIGATE': function (payload) { ... this.emitChange() ... }
};
MyStore.prototype.getFoo = function () { var context = this.getContext(), ... }
module.exports = MyStore;
```


### createStore

`require('dispatchr/addons/createStore')` provides a helper function for 
creating stores similar to React's `createClass` function. The created store 
class will extend BaseStore and have the same built-in functions. Example:

```js
var createStore = require('dispatchr/addons/createStore');
var MyStore = createStore({
    initialize: function () {}, // Called immediately after instantiation
    storeName: 'MyStore',
    handlers: {
        'NAVIGATE': function (payload) { ... this.emitChange() ... }
    }
    foo: function () { ... }
});
module.exports = MyStore;
```


## APIs

- [Dispatchr](https://github.com/yahoo/fluxible/blob/master/packages/dispatchr/docs/dispatchr.md)
- [Store](https://github.com/yahoo/fluxible/blob/master/packages/dispatchr/docs/store.md)



## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
[Flux]: http://facebook.github.io/flux/docs/overview.html
