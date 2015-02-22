# Fluxible

[![npm version](https://badge.fury.io/js/fluxible.svg)](http://badge.fury.io/js/fluxible)
[![Build Status](https://travis-ci.org/yahoo/fluxible.svg?branch=master)](https://travis-ci.org/yahoo/fluxible)
[![Dependency Status](https://david-dm.org/yahoo/fluxible.svg)](https://david-dm.org/yahoo/fluxible)
[![devDependency Status](https://david-dm.org/yahoo/fluxible/dev-status.svg)](https://david-dm.org/yahoo/fluxible#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/fluxible/badge.png?branch=master)](https://coveralls.io/r/yahoo/fluxible?branch=master)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/yahoo/fluxible)

Pluggable container for isomorphic [flux](https://github.com/facebook/flux) applications that provides interfaces that are common throughout the Flux architecture and restricts usage of these APIs to only the parts that need them to enforce the unidirectional flow.

## Install

`npm install --save fluxible`

## Usage

```js
var AppComponent = require('./components/Application.jsx'); // Top level React component
var Fluxible = require('fluxible');
var app = new Fluxible({
    appComponent: AppComponent // optional top level component
});

// Per request/session
var context = app.createContext();
var loadPageAction = require('./actions/loadPage');
context.executeAction(loadPageAction, {/*payload*/}, function (err) {
    if (err) throw err;
    var element = AppComponent({
        // Allow the component to access only certain methods of this session context
        context: context.getComponentContext();
    });
    // OR since the appComponent was passed into the constructor:
    // var element = context.createElement({});

    var html = React.renderToString(element);

    var appState = app.dehydrate(context);
    // Expose appState to the client
});
```

For a more extensive example of usage both on the server and the client, see [flux-examples](https://github.com/yahoo/flux-examples).

### Dehydration/Rehydration

Fluxible uses reserved methods throughout called `rehydrate` and `dehydrate` which are responsible for taking a snapshot of server-side state so that it can be sent to the browser and rehydrated back to the same state in the browser. This naming scheme also extends to [dispatchr](https://github.com/yahoo/dispatchr) which takes care of dehydrating/rehydrating the store instances.

There are two kinds of state within fluxible:

 * **Application State**: Settings and data that are registered on server start
 * **Context State**: Settings and data that are created per context/request

Application level rehydrate method is allowed asynchronous operation in case it needs to load JavaScript or data on demand.

### Context Types

Within a context, Fluxible creates interfaces providing access to only certain parts of the system. These are broken down as such:

 * **Action Context**: interface accessible by action creator methods. Passed as first parameter to all action creators.
 * **Component Context**: interface accessible by React components. Should be passed as prop to top level React component and then propagated to child components that require acess to it.
 * **Store Context**: interface accessible by stores. Passed as first parameter to all stores. See [dispatchr docs](https://github.com/yahoo/dispatchr#constructor-1)

### Creating Plugins

Plugins allow you to extend the interface of each context type. Here, we'll give components access to the `getFoo()` function:

```js
var Fluxible = require('fluxible');
var app = new Fluxible();

app.plug({
    // Required unique name property
    name: 'TestPlugin',
    // Called after context creation to dynamically create a context plugin
    plugContext: function (options) {
        // `options` is the same as what is passed into `createContext(options)`
        var foo = options.foo;
        // Returns a context plugin
        return {
            // Method called to allow modification of the component context
            plugComponentContext: function (componentContext) {
                componentContext.getFoo = function () {
                    return foo;
                };
            },
            //plugActionContext: function (actionContext) {}
            //plugStoreContext: function (storeContext) {}

            // Allows context plugin settings to be persisted between server and client. Called on server
            // to send data down to the client
            dehydrate: function () {
                return {
                    foo: foo
                };
            },
            // Called on client to rehydrate the context plugin settings
            rehydrate: function (state) {
                foo = state.foo;
            }
        };
    },
    // Allows dehydration of application plugin settings
    dehydrate: function () { return {}; },
    // Allows rehydration of application plugin settings
    rehydrate: function (state) {}
});

var context = app.createContext({
    foo: 'bar'
});

context.getComponentContext().getFoo(); // returns 'bar'
// or this.props.context.getFoo() from a React component
```

Example plugins:
 * [fluxible-plugin-fetchr](https://github.com/yahoo/fluxible-plugin-fetchr) - Polymorphic RESTful services
 * [fluxible-plugin-routr](https://github.com/yahoo/fluxible-plugin-routr) - Routing behavior

## Mixin

The mixin (accessible via `require('fluxible').Mixin`) uses React's context to provide access to the component context from within a component. This prevents you from having to pass the context to every component via props. This requires that you pass the component context as the context to React:

```js
var FluxibleMixin = require('fluxible').Mixin;
var Component = React.createClass({
    mixins: [FluxibleMixin],
    getInitialState: function () {
        return this.getStore(FooStore).getState();
    }
});

React.withContext(context.getComponentContext(), function () {
    var html = React.renderToString(<Component />);
});
```

The mixin can also be used to statically list store dependencies and listen to them automatically in componentDidMount. This is done by adding a static property `storeListeners` in your component.

You can do this with an array, which will default all store listeners to call the `onChange` method:

```js
var FluxibleMixin = require('fluxible').Mixin;
var MockStore = require('./stores/MockStore'); // Your store
var Component = React.createClass({
    mixins: [FluxibleMixin],
    statics: {
        storeListeners: [MockStore]
    },
    onChange: function () {
        done();
    },
});
```

Or you can be more explicit with which function to call for each store by using a hash:

```js
var FluxibleMixin = require('fluxible').Mixin;
var MockStore = require('./stores/MockStore'); // Your store
var Component = React.createClass({
    mixins: [FluxibleMixin],
    statics: {
        storeListeners: {
            onMockStoreChange: [MockStore]
        }
    },
    onMockStoreChange: function () {
        done();
    },
});
```

This prevents boilerplate for listening to stores in `componentDidMount` and unlistening in `componentWillUnmount`.

## Helper Utilities

Fluxible also exports [dispatcher's store utilities](https://github.com/yahoo/dispatchr#helper-utilities) so that you do not need to have an additional dependency on dispatchr. They are available by using `require('fluxible/utils/BaseStore')` and `require('fluxible/utils/createStore')`.

## APIs

- [Fluxible](https://github.com/yahoo/fluxible/blob/master/docs/fluxible.md)
- [FluxibleContext](https://github.com/yahoo/fluxible/blob/master/docs/fluxible-context.md)


## License

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
