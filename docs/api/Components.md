# API: React Components

React components need to be able to access the state of the application that is held within stores and also be able to execute actions that the stores can react to. Since we are not using singletons, we need to provide access to the current request's `ComponentContext`.

The [`ComponentContext`](#component-context) should be passed as a prop to the top level component for your application. From there, it needs to be propagated to any controller views using two options:

 * Pass it through props to every child
 * Use React's context
 
We recommend using React's context, since it will implicitly handle propagation as long as the controller view registers its `contextTypes`. We provide a couple of helpers to make this easier: 

## FluxibleComponent

The `FluxibleComponent` is a wrapper component that will provide all of its children with access to the Fluxible component
context via React's `childContextTypes` and `getChildContext`. This should be used to wrap your top level component. It provides access to the methods on the [component context](#component-context).

 You can get access to these methods by setting the correct `contextTypes` within your component or including the [`FluxibleMixin`](Components.md#fluxible-mixin) which will add them for you.

### Usage

If you have a component that needs access to the [`ComponentContext`](#component-context) methods:

 ```js
var Component = React.createClass({
    contextTypes: {
        getStore: React.PropTypes.func.isRequired,
        executeAction: React.PropTypes.func.isRequired
    },
    getInitialState: function () {
        return this.getStore(FooStore).getState();
    }
});
```

you can wrap the component with `FluxibleComponent` to provide the correct context:

```js
var FluxibleComponent = require('fluxible').FluxibleComponent;
var html = React.renderToString(
    <FluxibleComponent context={context.getComponentContext()}>
        <Component />
    </FluxibleComponent>
);
```

 If you are using [`FluxibleContext.createElement()`](FluxibleContext.md#createElementprops) this will happen for you automatically:

```js
var html = React.renderToString(context.createElement());
```

## FluxibleMixin

The mixin (accessible via `require('fluxible').FluxibleMixin`) will add the `contextTypes` `getStore` and `executeAction`
to your component.

The mixin can also be used to statically list store dependencies and listen to them automatically in `componentDidMount`. This is done by adding a static property `storeListeners` in your component.

You can do this with an array, which will default all store listeners to call the `onChange` method:

```js
var FluxibleMixin = require('fluxible').FluxibleMixin;
var FooStore = require('./stores/FooStore'); // Your store
var Component = React.createClass({
    mixins: [FluxibleMixin],
    statics: {
        storeListeners: [FooStore]
    },
    onChange: function () {
        this.setState(this.getStore(FooStore).getState());
    },
});
```

Or you can be more explicit with which function to call for each store by using a hash:

```js
var FluxibleMixin = require('fluxible').FluxibleMixin;
var FooStore = require('./stores/FooStore'); // Your store
var BarStore = require('./stores/BarStore'); // Your store
var Component = React.createClass({
    mixins: [FluxibleMixin],
    statics: {
        storeListeners: {
            onFooStoreChange: [FooStore],
            onBarStoreChange: [BarStore]
        }
    },
    onFooStoreChange: function () {
        this.setState(this.getStore(FooStore).getState());
    },
    onBarStateChange: function () {
        this.setState(this.getStore(BarStore).getState());
    }
});
```

This prevents boilerplate for listening to stores in `componentDidMount` and unlistening in `componentWillUnmount`.


## Component Context

The component context receives limited access to the [FluxibleContext](FluxibleContext.md) so that it can't dispatch directly. It contains the following methods:

 * `executeAction(action, payload)`
 * `getStore(storeConstructor)`
 
It's important to note that `executeAction` does not allow passing a callback from the component. This enforces that the actions are fire-and-forget and that state changes should only be handled through the Flux flow. You may however provide an app level `componentActionHandler` function when instantiating Fluxible. This allows you to handle errors (at a high level) spawning from components firing actions.
