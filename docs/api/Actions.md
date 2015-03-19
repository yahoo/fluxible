# API: Actions

Actions in Fluxible are stateless functions that receive three parameters:

 * [`actionContext`](#Action Context) - Provides access to Flux methods
 * `payload` - The action payload
 * `done` - A function to be called when the action has been completed

```js
module.exports = function myAction(actionContext, payload, done) {
    setTimeout(function () { // simulate async
        actionContext.dispatch('MY_ACTION', payload);
        done();
    }, 10);
};
```

The first action for a context is called via `context.executeAction(myAction, payload)` but actions can also be fired by other actions:

```js
module.exports = function myParentAction(actionContext, payload, done) {
    actionContext.executeAction(myAction, payload, done);
};
```

or from a component:

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

## Action Context

Actions have the most access to the Flux context. The context contains the following methods:

### `dispatch(eventName, payload)`

Dispatches a new data event and calls the store handlers.

### `executeAction(action, payload, done)`

Executes another action and allows waiting for the `done` callback to be called.

### `getStore(storeConstructor)`

Retrieve a store instance by constructor. Useful for reading from the store. Should never be used for modifying the store.
