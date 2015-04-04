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

 * Singleton-free for server rendering
 * [Store](https://github.com/yahoo/fluxible/blob/master/docs/api/Stores.md) dehydration for client bootstrapping
 * Stateless async [actions](https://github.com/yahoo/fluxible/blob/master/docs/api/Actions.md)
 * Higher order [components](https://github.com/yahoo/fluxible/blob/master/docs/api/Components.md) for easy integration
 * Enforcement of Flux flow - restricted access to the [Flux interface](https://github.com/yahoo/fluxible/blob/master/docs/api/FluxibleContext.md) from within components
 * [Pluggable](https://github.com/yahoo/fluxible/blob/master/docs/api/Plugins.md) - add your own interfaces to the Flux context
 * Updated for React 0.13

## Extras

 * [Yeoman generator](https://github.com/yahoo/generator-fluxible)
 * [Example Applications](https://github.com/yahoo/flux-examples)
 * [Fluxible Routing](https://github.com/yahoo/fluxible-plugin-routr)
 * [Isomorphic Data Services](https://github.com/yahoo/fluxible-plugin-fetchr)

## Usage

```js
import Fluxible from 'fluxible';
import React from 'react';
import {connectToStores, createStore, provideContext} from 'fluxible/addons';
import objectAssign from 'object-assign';

// Action
const action = (actionContext, payload) => {
    actionContext.dispatch('FOO_ACTION', payload);
};

// Store
const FooStore = createStore({
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
class App extends React.Component {
    render() {
        return <span>{this.props.foo}</span>
    }
}

App = provideContext(connectToStores(App, [FooStore], {
    FooStore(state, store) {
        objectAssign(state, store.getState());
    }
}));

// App
const app = new Fluxible({
    component: App,
    stores: [FooStore]
});

// Bootstrap
const context = app.createContext();
context.executeAction(action, 'bar', function () {
    console.log(React.renderToString(context.createElement()));
});
```

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
