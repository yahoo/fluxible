# API Documentation

`var Fluxible = require('fluxible')` exports the following:

 * [`Fluxible`](Fluxible.md)
 * [`Fluxible.FluxibleComponent`](Components.md#fluxiblecomponent)
 * [`Fluxible.FluxibleMixin`](Components.md#fluxiblemixin)


or if you're using ES6:

```js
import {Fluxible, FluxibleComponent, FluxibleMixin} from 'fluxible';
```

While building your application, you will need to build [stores](Stores.md), [actions](Actions.md) and connect them to your [components](Components.md).

## Addons

`var FluxibleAddons = require('fluxible/addons')` also provides helper utilities for creating stores:

 * [`FluxibleAddons.BaseStore`](Stores.md#basestore)
 * [`FluxibleAddons.createStore`](Stores.md#createstore)

or if you're using ES6:

```js
import {BaseStore, createStore} from 'fluxible/addons';
```

These libraries are not bundled with the main Fluxible export because stores are classes that are decoupled from Fluxible entirely.

## Utils

Fluxible also provides the following utilities for testing your components:

* [MockActionContext](TestUtils.md#mockactioncontext)
* [MockComponentContext](TestUtils.md#mockcomponentcontext)
