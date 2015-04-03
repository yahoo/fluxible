# API Documentation

`var Fluxible = require('fluxible')` exports the following:

 * [`Fluxible`](Fluxible.md)


or if you're using ES6:

```js
import Fluxible from 'fluxible';
```

While building your application, you will need to build [stores](Stores.md), [actions](Actions.md) and connect them to your [components](Components.md).

Occasionally you may find that you need to use [plugins](Plugins.md) to extend Fluxible's interfaces.

## Addons

`var FluxibleAddons = require('fluxible/addons')` also provides helper utilities for creating stores:

 * [`FluxibleAddons.BaseStore`](addons/BaseStore.md)
 * [`FluxibleAddons.connectToStores`](addons/connectToStores.md)
 * [`FluxibleAddons.createStore`](addons/CreateStore.md)
 * [`FluxibleAddons.FluxibleComponent`](addons/FluxibleComponent.md)
 * [`FluxibleAddons.FluxibleMixin`](addons/FluxibleMixin.md)
 * [`FluxibleAddons.provideContext`](addons/provideContext.md)

or if you're using ES6:

```js
import {BaseStore, connectToStores, createStore, FluxibleComponent, FluxibleMixin, provideContext} from 'fluxible/addons';
```

These libraries are not bundled with the main Fluxible export because stores are decoupled from Fluxible and React integration changes as React changes.

## Utils

Fluxible also provides the following utilities for testing your components:

* [createMockActionContext](Actions.md#testing)
* [createMockComponentContext](Components.md#testing)
