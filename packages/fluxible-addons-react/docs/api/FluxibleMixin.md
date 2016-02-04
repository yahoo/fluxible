# FluxibleMixin

***FluxibleMixin will be deprecated since React mixin support will eventually
be removed. It is highly recommended to use [provideContext](provideContext.md) 
and [connectToStores](connectToStores.md) instead.***

```js
var FluxibleMixin = require('fluxible-addons-react/FluxibleMixin');
```

The mixin will add the `contextTypes` `getStore` and `executeAction`
to your component.

The mixin can also be used to statically list store dependencies and listen to 
them automatically in `componentDidMount`. This is done by adding a static 
property `storeListeners` in your component.

You can do this with an array, which will default all store listeners to call 
the `onChange` method:

```js
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

This prevents boilerplate for listening to stores in `componentDidMount` and 
unlistening in `componentWillUnmount`.
