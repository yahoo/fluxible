# API Documentation

`var Fluxible = require('fluxible')`` exports the following:

 * [`Fluxible`](Fluxible.md)
 * [`Fluxible.FluxibleComponent`](FluxibleComponent.md)
 * [`Fluxible.FluxibleMixin`](FluxibleMixin.md)


or if you're using ES6:

```js
import {Fluxible, FluxibleComponent, FluxibleMixin} from 'fluxible';
```

While building your application, you will need to build [stores](Store.md), [actions](Actions.md) and connect them to your [components](Components.md).

## Addons

`var FluxibleAddons = require('fluxible/addons')` also provides helper utilities for creating stores:

 * [`FluxibleAddons.BaseStore`](Stores.md#BaseStore)
 * [`FluxibleAddons.createStore`](Stores.md#createStore)

 or if you're using ES6:

 ```js
 import {BaseStore, createStore} from 'fluxible/addons';
 ```

 These libraries are not bundled with the main Fluxible export because stores are classes that are decoupled from Fluxible entirely.
 
 ## Utils
 
 Fluxible also provides the following utilities for testing your components:
 
  * [MockActionContext](TestUtils.md#MockActionContext)
  * [MockComponentContext](TestUtils.md#MockComponentContext)
