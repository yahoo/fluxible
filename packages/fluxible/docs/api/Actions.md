# API: `Actions`

Actions (called "action creators" in Flux) in Fluxible are stateless asynchronous functions that receive three parameters:

 * [`actionContext`](#action-context) - Provides access to Flux methods
 * `payload` - The action payload
 * `done` (optional when using promises) - A function to be called when the action has been completed

If the action does not return a promise and takes three parameters, executeAction will wait for the done callback:

```js
export default function myAction(actionContext, payload, done) {
    setTimeout(function () { // simulate async
        actionContext.dispatch('MY_ACTION', payload);
        done();
    }, 10);
}
```

If the action returns a promise, executeAction will wait for it to be resolved or rejected:

```js
export default function myPromiseAction(actionContext, payload) {
    return getServerData(payload).then(function (data) {
        actionContext.dispatch('RECEIVED_SERVER_DATA', data);
    });
};
```

If the action takes less than three parameters, executeAction will resolve the promise with the return value, if any:

```js
export default function mySyncAction(actionContext, payload) {
    return actionContext.dispatch('MY_ACTION', payload);
}
```

Actions are generally called via [`FluxibleContext.executeAction(myAction, payload, [done])`](FluxibleContext.md#executeactionaction-payload-callback) but actions can also be fired by other actions:

**Callback**

```js
export default function myParentAction(actionContext, payload, done) {
    actionContext.executeAction(myAction, payload, done);
}
```

**Promise**

```js
export default function myParentAction(actionContext, payload) {
    return actionContext.executeAction(myAction, payload)
        .then(function (result) {
            // do something
        });
}
```


or from a [component](Components.md):

```js
import myAction from './myAction';
class MyComponent extends React.Component {
    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick (e) {
        this.context.executeAction(myAction, {});
    }
    render () {
        return <button onClick={this.onClick}>Click Me</button>;
    }
};
MyComponent.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
export default MyComponent;
```

It's important to note that `executeAction` does not allow passing a callback from the component nor does it return the promise. This enforces that the actions are fire-and-forget and that state changes should only be handled through the Flux flow. When actions are executed from components, the callback becomes the `componentActionErrorHandler` function provided to the [Fluxible](Fluxible.md) constructor.

## Action Context

Actions have the most access to the Flux context. The context contains the following methods and properties:

### `dispatch(eventName, payload)`

Dispatches a new data event and calls the store handlers.

### `executeAction(action, payload, [done])`

Executes another action. Allows waiting for the returned promise to be resolved or rejected, or the optional `done` callback to be called.

### `getStore(storeConstructor)`

Retrieve a store instance by constructor. Useful for reading from the store. Should never be used for modifying the store.

### `rootId`

An `rootId` is generated for each root level action that is executed. This `rootId` will be persisted to all subsequent actions that are called under the root action.

### `stack`

The `stack` is an array of action names that shows which actions were called above the current one. This is helpful for debugging but shouldn't be used for anything else.

## Testing

When testing your actions, you can use our `createMockActionContext` library and pass an instance to your action to record the methods that the action calls on the context.

When `dispatch` is called, it will push an object to the `dispatchCalls` array. Each object contains a `name` and `payload` key.

When `executeAction` is called, it will push an object to the `executeActionCalls` array. Each object contains an `action` and `payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you can register stores to upon instantiation:
 
```js
createMockActionContext({ stores: [MockStore] });
```

### Usage

Here is an example mocha test that display using each of `ActionContext` methods being tested:

```js
import {createMockActionContext} from 'fluxible/utils';
import assert from 'assert';

// Real store, overridden with MockStore in test
import {BaseStore} from 'fluxible/addons';
class FooStore extends BaseStore {
    // ...
}
FooStore.storeName = 'FooStore';

// Actions being tested
let myAction = function (actionContext, payload, done) {
    let foo = actionContext.getStore(FooStore).getFoo() + payload;
    actionContext.dispatch('FOO', foo);
    actionContext.executeAction(otherAction, foo, done);
};

let otherAction = function (actionContext, payload, done) {
    done();
};

// the mock FooStore
class MockFooStore extends BaseStore {
    constructor (dispatcher) {
        super(dispatcher);
        this.foo = 'foo';
    }
    handleFoo (payload) {
        this.foo = payload;
        this.emitChange();
    }
    getFoo () {
        return this.foo;
    }
}
MockFooStore.storeName = 'FooStore'; // Matches FooStore.storeName
MockFooStore.handlers = {
    'FOO': 'handleFoo'
};

// Tests
describe('myAction', function () {
    let actionContext;

    beforeEach(function () {
        actionContext = createMockActionContext({
            stores: [MockFooStore]
        });
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
