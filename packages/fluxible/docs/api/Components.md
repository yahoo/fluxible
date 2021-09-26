# API: `React Components`

React components need to be able to access the state of the
application that is held within stores and also be able to execute
actions that the stores can react to. Since we are not using
singletons, we need to provide access to the current request's
`ComponentContext`.

## Component Context

The component context receives limited access to the
[FluxibleContext](FluxibleContext.md) so that it can't dispatch
directly. It contains the following methods:

 * `executeAction(action, payload)`
 * `getStore(storeConstructor)`

It's important to note that ***`executeAction` does not allow passing
a callback from the component***. This enforces that the actions are
fire-and-forget and that state changes should only be handled through
the Flux flow. You may however provide an app level
`componentActionErrorHandler` function when instantiating
Fluxible. This allows you to handle errors (at a high level) spawning
from components firing actions.

## Providing the Context

To make the component context available to all your components, you
must wrap your top level component in a `FluxibleProvider`
component. `FluxibleProvider` takes the
[`ComponentContext`](#component-context) as prop and will make it
available to all children components down the tree:

```js
// App.jsx

import Fluxible from from 'fluxible';
import { FluxibleProvider } from 'fluxible-addons-react';

const fluxibleApp = new Fluxible();

const context = fluxibleApp.createContext();

const componentContext = context.getComponentContext();

const App = () => {
  return (
    <FluxibleProvider context={componentContext}>
      <MyComponent />
    </FluxibleProvider>
  );
};
```

Another possibility would be to wrap the `MyComponent` from example
above with the higher-order component
[provideContext](../../../../packages/fluxible-addons-react/docs/api/provideContext.md):

```js
// MyComponent.jsx

import { provideContext } from 'fluxible-addons-react';

const MyComponent = () => {
    return // ...
};

export default provideContext(MyComponent);
```

Then, in `App.jsx`:

```js
// App.jsx

const App = () => {
  return <MyComponent context={componentContext} />;
};
```

One last possibility, would be to use
[FluxibleComponent](../../../../packages/fluxible-addons-react/docs/api/FluxibleComponent.md). `FluxibleComponent`
is just a React component that will wrap its children with
`FluxibleProvider` (very similar as the first example from this
section):

```js
const App = () => {
  return (
    <FluxibleComponent context={componentContext}>
      <MyComponent />
    </FluxibleComponent>
  );
};
```

The only difference is that it will also inject the context as prop in
`MyComponent`. `FluxibleComponent` can considered a legacy API from
the times where setting up react context would require setting context
types and so on. It has been kept for compatibility reasons with older
applications.


## Accessing Stores

It is of course important that your component can access your store
state. You also need to make sure that any changes to the store are
received by the component so that it can re-render itself. A component
that listens to a store for changes without any helpers would look
similar to this:

```js
import { FluxibleComponentContext } from 'fluxible-addons-react';
import FooStore from '../stores/FooStore';

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getStoreState();
    }
    getStoreState () {
        return {
            foo: this.context.getStore(FooStore).getFoo()
        }
    }
    componentDidMount () {
        this.context.getStore(FooStore).addChangeListener(this._onStoreChange);
    }
    componentWillUnmount () {
        this.context.getStore(FooStore).removeChangeListener(this._onStoreChange);
    }
    _onStoreChange () {
        this.setState(this.getStoreState());
    }
    render () {...}
}

MyComponent.contextType = FluxibleComponentContext;
```

To eliminate some of this boilerplate and eliminate potential
developer error (for instance forgetting `componentWillUnmount`),
Fluxible provides the following helpers to connect your components to
your stores:

 * [connectToStores](../../../../packages/fluxible-addons-react/docs/api/connectToStores.md)

## Executing Actions

Executing actions from a component is as simple as requiring the
action you want to execute and calling `executeAction` on the context:

```js
import { FluxibleComponentContext } from 'fluxible-addons-react';
import fooAction from '../actions/fooAction';

class MyComponent extends React.Component {
    onClick () {
        this.context.executeAction(fooAction, { /*payload*/ });
    },
    render () {
        return <button onClick={this.onClick}>Click me</button>;
    }
}

MyComponent.contextType = FluxibleComponentContext;
```

## Testing

When testing your components, you can use our `MockComponentContext`
library and pass an instance to your component to record the methods
that the component calls on the context.

When `executeAction` is called, it will push an object to the
`executeActionCalls` array. Each object contains an `action` and
`payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you
can register stores to upon instantiation:

```js
createMockComponentContext({ stores: [MockStore] });
```

### Usage

Here is an example component test that uses `React.TestUtils` to
render the component into `jsdom` to test the store integration.

```js
import {createMockComponentContext} from 'fluxible/utils';
import assert from 'assert';
import jsdom from 'jsdom';
import mockery from 'mockery';

// Real store, overridden with MockStore in test
import {BaseStore} from 'fluxible/addons';

class FooStore extends BaseStore {
    // ...
}
FooStore.storeName = 'FooStore';

// Action fired from component, could be overridden using Mockery library
let myAction = function (actionContext, payload, done) {
    var foo = actionContext.getStore(FooStore).getFoo() + payload;
    actionContext.dispatch('FOO', foo);
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

describe('TestComponent', function () {
    var componentContext;
    var React;
    var ReactTestUtils;
    var provideContext;
    var connectToStores;
    var TestComponent;

    beforeEach(function (done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        componentContext = createMockComponentContext({
            stores: [MockFooStore]
        });
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            // React must be required after window is set
            React = require('react');
            ReactDOM = require('react-dom');
            ReactTestUtils = require('react-addons-test-utils');
            provideContext = require('fluxible-addons-react/provideContext');
            connectToStores = require('fluxible-addons-react/connectToStores');

            // The component being tested
            TestComponent = class TestComponent extends React.Component {
                render() {
                    return (
                      <button onClick={() => this.context.executeAction(myAction, 'bar')}>
                        {this.props.foo}
                      </button>
                    );
                }
            };
            TestComponent.contextType = FluxibleComponentContext;
            // Wrap with context provider and store connector
            TestComponent = provideContext(connectToStores(TestComponent, [FooStore], function (context, props) {
                return {
                    foo: context.getStore(FooStore).getFoo()
                };
            }));
            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    it('should call context executeAction when context provided via React context', function (done) {
        var component = ReactTestUtils.renderIntoDocument(
            <TestComponent context={componentContext} />
        );
        var node = ReactDOM.findDOMNode(component);
        assert.equal('foo', node.innerHTML);
        ReactTestUtils.Simulate.click(node);
        assert.equal('foobar', node.innerHTML);
        ReactTestUtils.Simulate.click(node);
        assert.equal('foobarbar', node.innerHTML);
        done();
    });
});
```
