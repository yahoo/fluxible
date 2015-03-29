# API: Actions

Actions in Fluxible are stateless functions that receive three parameters:

 * [`actionContext`](#action-context) - Provides access to Flux methods
 * `payload` - The action payload
 * `done` - A function to be called when the action has been completed

If the action does not return a promise and takes three parameters, executeAction will wait for the done callback:

```js
module.exports = function myAction(actionContext, payload, done) {
    setTimeout(function () { // simulate async
        actionContext.dispatch('MY_ACTION', payload);
        done();
    }, 10);
};
```

If the action returns a promise, executeAction will wait for it to be resolved or rejected:

```js
module.exports = function myPromiseAction(actionContext, payload) {
    return new Promise(function (resolve, reject) {
        getServerData(payload)
        .then(function (data) {
            actionContext.dispatch('RECEIVED_SERVER_DATA', data);
        })
        .then(resolve, reject);
    });
};
```

If the action takes less than three parameters, executeAction will resolve the promise with the return value, if any:

```js
module.export = function mySyncAction(actionContext, payload) {
    actionContext.dispatch('MY_ACTION', payload);
}
```

Actions are generally called via [`FluxibleContext.executeAction(myAction, payload, [done])`](FluxibleContext.md#executeactionaction-payload-callback) but actions can also be fired by other actions:

**Callback**

```js
module.exports = function myParentAction(actionContext, payload, done) {
    actionContext.executeAction(myAction, payload, done);
};
```

**Promise**

```js
module.exports = function myParentAction(actionContext, payload) {
    actionContext.executeAction(myAction, payload)
    .then(function (result) {
        // do something
    });
}
```


or from a [component](Components.md):

```js
var myAction = require('./myAction');
module.exports React.createClass({
    contextTypes: {
        executeAction: React.PropTypes.func.isRequired
    },
    onClick: function (e) {
        this.context.executeAction(myAction, {});
    },
    render: function () {
        return <button onClick={this.onClick}>Click Me</a>;
    }
});
```

It's important to note that `executeAction` does not allow passing a callback from the component nor does it return the promise. This enforces that the actions are fire-and-forget and that state changes should only be handled through the Flux flow. When actions are executed from components, the callback becomes the `componentActionHandler` function provided to the [Fluxible](Fluxible.md) constructor.

## Action Context

Actions have the most access to the Flux context. The context contains the following methods:

### `dispatch(eventName, payload)`

Dispatches a new data event and calls the store handlers.

### `executeAction(action, payload, [done])`

Executes another action. Allows waiting for the returned promise to be resolved or rejected, or the optional `done` callback to be called.

### `getStore(storeConstructor)`

Retrieve a store instance by constructor. Useful for reading from the store. Should never be used for modifying the store.


## Testing

When testing your actions, you can use our `MockActionContext` library and pass an instance to your action to record the methods that the action calls on the context.

When `dispatch` is called, it will push an object to the `dispatchCalls` array. Each object contains a `name` and `payload` key.

When `executeAction` is called, it will push an object to the `executeActionCalls` array. Each object contains an `action` and `payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you can register stores to via `MockActionContext.registerStore(MockStore)`.

### Usage

Here is an example mocha test that display using each of `ActionContext` methods being tested:

```js
var MockActionContext = require('fluxible/utils').createMockActionContext();

// Real store, overridden with MockStore in test
var createStore = require('fluxible/addons').createStore;
var FooStore = createStore({
    storeName: 'FooStore'
});

// Actions being tested
var myAction = function (actionContext, payload, done) {
    var foo = actionContext.getStore(FooStore).getFoo() + payload;
    actionContext.dispatch('FOO', foo);
    actionContext.executeAction(otherAction, foo, done);
};

var otherAction = function (actionContext, payload, done) {
    done();
};

// Register the mock FooStore
MockActionContext.registerStore(createStore({
    storeName: 'FooStore', // Matches FooStore.storeName
    handlers: {
        FOO: 'handleFoo'
    },
    initialize: function () {
        this.foo = 'foo';
    },
    handleFoo: function (payload) {
        this.foo = payload
    },
    getFoo: function () {
        return this.foo;
    }
}));


// Tests
describe('myAction', function () {
    var assert = require('assert');
    var actionContext;

    beforeEach(function () {
        actionContext = new MockActionContext();
    });

    it('should dispatch foo', function (done) {
        myAction(actionContext, 'bar', function () {
            assert.equal(1, actionContext.dispatchCalls.length);
            assert.equal('FOO', actionContext.dispatchCalls[0].name);
            assert.equal('foobar', actionContext.dispatchCalls[0].payload);
            assert.equal(1, actionContext.executeActionCalls.length);
            assert.equal(otherAction, actionContext.executeActionCalls[0].action);
            assert.equal('foobar', actionContext.executeActionCalls[0].payload);
            done();
        });
    });
});
```
