# API: React Components

React components need to be able to access the state of the application that is held within stores and also be able to execute actions that the stores can react to. Since we are not using singletons, we need to provide access to the current request's `ComponentContext`.

The [`ComponentContext`](#component-context) should be passed as a prop to the top level component for your application. From there, it needs to be propagated to any controller views using two options:

 * Pass it through props to every child
 * Use React's context

We recommend using React's context, since it will implicitly handle propagation as long as the controller view registers its `contextTypes`. We provide a couple of helpers to make this easier:

## FluxibleComponent

The `FluxibleComponent` is a wrapper component that will provide all of its children with access to the Fluxible component
context via React's `childContextTypes` and `getChildContext`. This should be used to wrap your top level component. It provides access to the methods on the [component context](#component-context).

 You can get access to these methods by setting the correct `contextTypes` within your component or including the [`FluxibleMixin`](Components.md#fluxiblemixin) which will add them for you.

### Usage

If you have a component that needs access to the [`ComponentContext`](#component-context) methods:

 ```js
class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getStore(FooStore).getState();
    }
}
Component.contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
};
```

you can wrap the component with `FluxibleComponent` to provide the correct context:

```js
import {FluxibleComponent} from 'fluxible';
let html = React.renderToString(
    <FluxibleComponent context={context.getComponentContext()}>
        <Component />
    </FluxibleComponent>
);
```

If you are using [`FluxibleContext.createElement()`](FluxibleContext.md#createElementprops) this will happen for you automatically:

```js
let html = React.renderToString(context.createElement());
```

## FluxibleMixin

The mixin (accessible via `require('fluxible').FluxibleMixin`) will add the `contextTypes` `getStore` and `executeAction`
to your component.

The mixin can also be used to statically list store dependencies and listen to them automatically in `componentDidMount`. This is done by adding a static property `storeListeners` in your component.

You can do this with an array, which will default all store listeners to call the `onChange` method:

```js
import {createMockComponentContext} from 'fluxible/utils';
import assert from 'assert';
import jsdom from 'jsdom';

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
    var FluxibleMixin;
    var TestComponent;

    beforeEach(function (done) {
        componentContext = createMockComponentContext({
            stores: [MockFooStore]
        });
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            // React must be required after window is set
            React = require('react');
            ReactTestUtils = require('react/lib/ReactTestUtils');
            FluxibleMixin = require('fluxible/index').FluxibleMixin;

            // The component being tested
            TestComponent = React.createClass({
                mixins: [FluxibleMixin],
                statics: {
                    storeListeners: [FooStore]
                },
                getInitialState: function () {
                    return {
                        foo: this.context.getStore(FooStore).getFoo()
                    };
                },
                onChange: function () { // Called when FooStore emits change
                    this.setState({
                        foo: this.context.getStore(FooStore).getFoo()
                    });
                },
                onClick: function () {
                    this.context.executeAction(myAction, 'bar');
                },
                render: function () {
                    return <button onClick={this.onClick}>{this.state.foo}</button>;
                }
            });
            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    it('should call context executeAction when context provided via React context', function (done) {
        var FluxibleComponent = require('fluxible/index').FluxibleComponent;
        var component = ReactTestUtils.renderIntoDocument(
            <FluxibleComponent context={componentContext}>
                <TestComponent />
            </FluxibleComponent>
        );
        var node = component.getDOMNode();
        assert.equal('foo', node.innerHTML);
        ReactTestUtils.Simulate.click(node);
        assert.equal('foobar', node.innerHTML);
        ReactTestUtils.Simulate.click(node);
        assert.equal('foobarbar', node.innerHTML);
        done();
    });
});
```
