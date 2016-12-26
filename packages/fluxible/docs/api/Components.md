# API: `React Components`

React components need to be able to access the state of the application that is held within stores and also be able to execute actions that the stores can react to. Since we are not using singletons, we need to provide access to the current request's `ComponentContext`.

## Component Context

The component context receives limited access to the [FluxibleContext](FluxibleContext.md) so that it can't dispatch directly. It contains the following methods:

 * `executeAction(action, payload)`
 * `getStore(storeConstructor)`

It's important to note that ***`executeAction` does not allow passing a callback from the component***. This enforces that the actions are fire-and-forget and that state changes should only be handled through the Flux flow. You may however provide an app level `componentActionErrorHandler` function when instantiating Fluxible. This allows you to handle errors (at a high level) spawning from components firing actions.

## Accessing the Context

The [`ComponentContext`](#component-context) should be passed as a prop to the top level component for your application. From there, it needs to be propagated to any controller views using two options:

 * Use React's context ***(recommended)***
 * Pass it through props to every child

We recommend using React's context, since it will implicitly handle propagation as long as the controller view registers its `contextTypes`. We provide a couple of helpers to make this easier:

 * [provideContext](../../../../packages/fluxible-addons-react/docs/api/provideContext.md) ***(recommended)***- higher-order component that declares child context (declarative; supports custom `childContextTypes`)
 * [FluxibleComponent](../../../../packages/fluxible-addons-react/docs/api/FluxibleComponent.md) - wrapper component that declares child context (imperative)

## Accessing Stores

It is of course important that your component can access your store state. You can access the store instance via `this.context.getStore(StoreConstructor)`. You also need to make sure that any changes to the store are received by the component so that it can re-render itself. A component that listens to a store for changes without any helpers would look similar to this:

```js
import FooStore from '../stores/FooStore';
class MyComponent extends React.Component {
    static contextTypes = {
        getStore: React.PropTypes.func.isRequired
    }
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
```

To eliminate some of this boilerplate and eliminate potential developer error (for instance forgetting `componentWillUnmount`), Fluxible provides the following helpers for connecting your components to your stores:

 * [connectToStores](../../../../packages/fluxible-addons-react/docs/api/connectToStores.md) ***(recommended)***
 * [FluxibleMixin](../../../../packages/fluxible-addons-react/docs/api/FluxibleMixin.md) *(deprecated)*

## Executing Actions

Executing actions from a component is as simple as requiring the action you want to execute and calling `executeAction` on the context:

```js
import fooAction from '../actions/fooAction';
class MyComponent extends React.Component {
    static contextTypes = {
        executeAction: React.PropTypes.func.isRequired
    }
    onClick () {
        this.context.executeAction(fooAction, { /*payload*/ });
    },
    render () {
        return <button onClick={this.onClick}>Click me</button>;
    }
}
```

## Testing

When testing your components, you can use our `MockComponentContext` library and pass an instance to your component to record the methods that the component calls on the context.

When `executeAction` is called, it will push an object to the `executeActionCalls` array. Each object contains an `action` and `payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you can register stores to upon instantiation:

```js
createMockComponentContext({ stores: [MockStore] });
```

### Usage

Here is an example component test that uses `React.TestUtils` to render the component into `jsdom` to test the store integration.

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
            TestComponent = React.createClass({
                contextTypes: {
                    executeAction: React.PropTypes.func.isRequired
                },
                onClick: function () {
                    this.context.executeAction(myAction, 'bar');
                },
                render: function () {
                    return <button onClick={this.onClick}>{this.props.foo}</button>;
                }
            });
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
