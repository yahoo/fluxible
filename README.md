# Fluxible

[![npm version](https://img.shields.io/npm/v/fluxible.svg?style=flat-square)](https://www.npmjs.com/package/fluxible)
[![Build Status](https://img.shields.io/travis/yahoo/fluxible.svg?style=flat-square)](https://travis-ci.org/yahoo/fluxible)
[![Coverage Status](https://img.shields.io/coveralls/yahoo/fluxible.svg?style=flat-square)](https://coveralls.io/r/yahoo/fluxible?branch=master)
[![Dependency Status](https://img.shields.io/david/yahoo/fluxible.svg?style=flat-square)](https://david-dm.org/yahoo/fluxible)
[![devDependency Status](https://img.shields.io/david/dev/yahoo/fluxible.svg?style=flat-square)](https://david-dm.org/yahoo/fluxible#info=devDependencies)

Pluggable, singleton-free container for isomorphic [Flux](https://github.com/facebook/flux) applications.

```bash
$ npm install --save fluxible
```

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/yahoo/fluxible)

## Docs

 * [Quick Start](https://github.com/yahoo/fluxible/blob/master/docs/quick-start.md)
 * [API](https://github.com/yahoo/fluxible/blob/master/docs/api/README.md)

## Features

 * Singleton-free for [server rendering](https://github.com/yahoo/fluxible/blob/master/docs/api/server-rendering.md)
 * [Server dehydration](https://github.com/yahoo/fluxible/blob/master/docs/guides/server-rendering.md#dehydrationrehydration) for client bootstrapping
 * Stateless async [actions](https://github.com/yahoo/fluxible/blob/master/docs/api/Actions.md)
 * React [mixin](https://github.com/yahoo/fluxible/blob/master/docs/api/FluxibleMixin.md) and [component](https://github.com/yahoo/fluxible/blob/master/docs/api/FluxibleComponent.md) for easy integration
 * Enforcement of Flux flow - restricted access to the [Flux context](https://github.com/yahoo/fluxible/blob/master/docs/api/FluxibleContext.md) from within components
 * [Pluggable](https://github.com/yahoo/fluxible/blob/master/docs/api/Plugins.md) - add your own interfaces to the Flux context
 * Updated for React 0.13
 
## Extras

 * [Yeoman generator](https://github.com/yahoo/generator-fluxible)
 * [Example Applications](https://github.com/yahoo/flux-examples)
 * [Fluxible Routing](https://github.com/yahoo/fluxible-plugin-routr)
 * [Isomorphic Data Services](https://github.com/yahoo/fluxible-plugin-fetchr)
 
## Usage

```js
var Fluxible = require('fluxible');
var React = require('react');

// Action
var action = function (context, payload, done) {
    context.dispatch('FOO_ACTION', payload);
    done();
};

// Store
var createStore = require('fluxible/addons').createStore;
var Store = createStore({
    storeName: 'FooStore',
    handlers: {
        'FOO_ACTION': 'fooHandler'
    },
    initialize: function () { // Set the initial state
        this.foo = null;
    },
    fooHandler: function (payload) { 
        this.foo = payload;
    },
    getState: function () {
        return {
            foo: this.foo
        }
    }
});

// Component
var App = React.createClass({
    mixins: [Fluxible.FluxibleMixin], // Calls onChange when storeListeners emit change
    statics: {
        storeListeners: [Store]
    },
    getInitialState: function () {
        return this.getStore(Store).getState();
    },
    onChange: function () {
        this.setState(this.getStore(Store).getState());
    },
    render: function () {
        return <span>{this.state.foo}</span>
    }
});

// App
var fluxibleApp = new Fluxible({
    component: App
});
fluxibleApp.registerStore(Store);

// Bootstrap
var context = fluxibleApp.createContext();
context.executeAction(action, 'bar', function () {
    console.log(React.renderToString(context.createElement()));
});
```

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
