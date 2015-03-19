# API: Utils

## MockActionContext

Useful for testing your actions, you can pass an instance of `MockActionContext` to your action to record the methods that the action calls on the context.

When `dispatch` is called, it will push an object to the `dispatchCalls` array. Each object contains a `name` and `payload` key.

When `executeAction` is called, it will push an object to the `executeActionCalls` array. Each object contains an `action` and `payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you can register stores to via `MockActionContext.registerStore(MockStore)`.

### Usage

Here is an example mocha test that display using each of `ActionContext` methods being tested:

```js
var MockActionContext = require('./utils').createMockActionContext();

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

## MockComponentContext

Useful for testing your components, you can pass an instance of `MockComponentContext` to your component to record the methods that the component calls on the context.

When `executeAction` is called, it will push an object to the `executeActionCalls` array. Each object contains an `action` and `payload` key.

`getStore` calls will be proxied to a dispatcher instance, which you can register stores to via `MockActionContext.registerStore(MockStore)`.

### Usage

Here is an example component test that uses `React.TestUtils` to render the component into `jsdom` to test the store integration.

```js
var MockComponentContext = require('./utils').createMockComponentContext();

// Real store, overridden with MockStore in test
var createStore = require('./addons').createStore;
var FooStore = createStore({
    storeName: 'FooStore'
});

// Action fired from component, could be overridden using Mockery library
var myAction = function (actionContext, payload, done) {
    var foo = actionContext.getStore(FooStore).getFoo() + payload;
    actionContext.dispatch('FOO', foo);
    done();
};

// Register the mock FooStore
MockComponentContext.registerStore(createStore({
    storeName: 'FooStore', // Matches FooStore.storeName
    handlers: {
        FOO: 'handleFoo'
    },
    initialize: function () {
        this.foo = 'foo';
    },
    handleFoo: function (payload) {
        this.foo = payload;
        this.emitChange();
    },
    getFoo: function () {
        return this.foo;
    }
}));

describe('TestComponent', function () {
    var jsdom = require('jsdom');
    var assert = require('assert');
    var componentContext;
    var React;
    var ReactTestUtils;
    var FluxibleMixin;
    var TestComponent;

    beforeEach(function (done) {
        componentContext = new MockComponentContext();
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;

            // React must be required after window is set
            React = require('react');
            ReactTestUtils = require('react/lib/ReactTestUtils');
            FluxibleMixin = require('fluxible').FluxibleMixin;

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
        var FluxibleComponent = require('fluxible').FluxibleComponent;
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
