# Fluxible

[![NPM version](https://badge.fury.io/js/fluxible.svg)](http://badge.fury.io/js/fluxible)
<!--
[![Build Status](https://img.shields.io/travis/yahoo/fluxible.svg)](https://travis-ci.org/yahoo/fluxible)
[![Coverage Status](https://img.shields.io/coveralls/yahoo/fluxible.svg)](https://coveralls.io/r/yahoo/fluxible?branch=master)
[![Dependency Status](https://img.shields.io/david/yahoo/fluxible.svg)](https://david-dm.org/yahoo/fluxible)
[![devDependency Status](https://img.shields.io/david/dev/yahoo/fluxible.svg)](https://david-dm.org/yahoo/fluxible#info=devDependencies)
-->

Pluggable, singleton-free container for isomorphic [Flux](https://github.com/facebook/flux) applications.

```bash
$ npm install --save fluxible
```

For support, please use [GitHub Discussions](https://github.com/yahoo/fluxible/discussions).

## Docs

 * [Quick Start](https://github.com/yahoo/fluxible/blob/master/docs/quick-start.md)
 * [API](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/README.md)

## Features

 * Singleton-free for server rendering
 * [Store](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/Stores.md) dehydration for client bootstrapping
 * Stateless async [actions](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/Actions.md)
 * Higher order [components](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/Components.md) for easy integration
 * Enforcement of Flux flow - restricted access to the [Flux interface](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/FluxibleContext.md) from within components
 * [Pluggable](https://github.com/yahoo/fluxible/blob/master/packages/fluxible/docs/api/Plugins.md) - add your own interfaces to the Flux context
 * Updated for React 15

## Extras

 * [Yeoman generator](https://github.com/yahoo/fluxible/blob/master/packages/generator-fluxible)
 * [Example Applications](https://github.com/yahoo/fluxible/blob/master/examples)
 * [Fluxible Routing](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router)
 * [Isomorphic Data Services](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-plugin-fetchr)

## Usage

```js
import Fluxible from 'fluxible';
import {createStore} from 'fluxible/addons';
import {
    connectToStores,
    createElementWithContext,
    provideContext
} from 'fluxible-addons-react';
import React from 'react';
import ReactDOM from 'react-dom/server';

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

App = provideContext(connectToStores(App, [FooStore], (context, props) => {
    return context.getStore(FooStore).getState();
}));

// App
const app = new Fluxible({
    component: App,
    stores: [FooStore]
});

// Bootstrap
const context = app.createContext();
context.executeAction(action, 'bar', (err) => {
    console.log(ReactDOM.renderToString(createElementWithContext(context)));
});
```

## Browser Compatibility

Fluxible is written with ES2015 in mind and should be used along with polyfills
for features like [`Promise`][Promise] and [`Object.assign`][objectAssign] 
in order to support all browsers. We recommend using [Babel][babel] along with
its [polyfill][polyfill].

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[objectAssign]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
[babel]: https://babeljs.io/
[polyfill]: https://babeljs.io/docs/usage/polyfill/
[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
