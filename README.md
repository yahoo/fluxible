# Fluxible

[![NPM version](https://badge.fury.io/js/fluxible.svg)](http://badge.fury.io/js/fluxible)
[![Build Status](https://img.shields.io/travis/yahoo/fluxible.svg)](https://travis-ci.org/yahoo/fluxible)
[![Coverage Status](https://img.shields.io/coveralls/yahoo/fluxible.svg)](https://coveralls.io/r/yahoo/fluxible?branch=master)
[![Dependency Status](https://img.shields.io/david/yahoo/fluxible.svg)](https://david-dm.org/yahoo/fluxible)
[![devDependency Status](https://img.shields.io/david/dev/yahoo/fluxible.svg)](https://david-dm.org/yahoo/fluxible#info=devDependencies)

Pluggable, singleton-free container for isomorphic [Flux](https://github.com/facebook/flux) applications.

```bash
$ npm install --save fluxible
```

Join the #fluxible channel of the [Reactiflux](http://reactiflux.com) Slack community.

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
 * [Fluxible Routing](https://github.com/yahoo/fluxible-router)
 * [Isomorphic Data Services](https://github.com/yahoo/fluxible-plugin-fetchr)

## Usage

```js
import Fluxible from 'fluxible';
import React from 'react';
import {connectToStores, createStore, provideContext} from 'fluxible/addons';

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
    initialize: () => { // Set the initial state
        this.foo = null;
    },
    fooHandler: (payload) => {
        this.foo = payload;
    },
    getState: () => {
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

App = provideContext(connectToStores(App, [FooStore], (stores, props) => {
    return stores.FooStore.getState();
}));

// App
const app = new Fluxible({
    component: App,
    stores: [FooStore]
});

// Bootstrap
const context = app.createContext();
context.executeAction(action, 'bar', (err) => {
    console.log(React.renderToString(context.createElement()));
});
```

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
