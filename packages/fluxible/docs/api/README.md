# API Documentation

[`Fluxible`](Fluxible.md) exports the following:

```js
import Fluxible from 'fluxible';
```

While building your application, you will need to build [stores](Stores.md), [actions](Actions.md) and connect them to your [components](Components.md).

Occasionally you may find that you need to use [plugins](Plugins.md) to extend Fluxible's interfaces.

## Addons

FluxibleAddons provides helper utilities for creating stores:

* [`BaseStore`](addons/BaseStore.md)
* [`createStore`](addons/createStore.md)

```js
import { BaseStore, createStore } from 'fluxible/addons';
```

These libraries are not bundled with the main Fluxible export because stores are decoupled from Fluxible.

## React Addons

Install the package:

```bash
npm i --save fluxible-addons-react
```

`fluxible-addons-react` provides helpers for using Fluxible with React.

* [`batchedUpdatePlugin`](../../../../packages/fluxible-addons-react/docs/api/batchedUpdatePlugin.md)
* [`connectToStores`](../../../../packages/fluxible-addons-react/docs/api/connectToStores.md)
* [`createElementWithContext`](../../../../packages/fluxible-addons-react/docs/api/createElementWithContext.md)
* [`FluxibleComponent`](../../../../packages/fluxible-addons-react/docs/api/FluxibleComponent.md)
* [`FluxibleMixin`](../../../../packages/fluxible-addons-react/docs/api/FluxibleMixin.md)
* [`provideContext`](../../../../packages/fluxible-addons-react/docs/api/provideContext.md)
* [`useFluxible`](../../../../packages/fluxible-addons-react/docs/api/useFluxible.md)
* [`withFluxible`](../../../../packages/fluxible-addons-react/docs/api/withFluxible.md)

```js
import { connectToStores, FluxibleComponent, FluxibleMixin, provideContext } from 'fluxible-addons-react';
```

These libraries are not bundled with Fluxible to allow for Fluxible usage with
other view libraries such as React Native.

## Debugging

* [fluxible-plugin-devtools](https://github.com/yahoo/fluxible/blob/main/packages/fluxible-plugin-devtools/docs/fluxible-plugin-devtools.md)

## Testing

Fluxible also provides the following utilities for testing your components:

* [createMockActionContext](Actions.md#testing)
* [createMockComponentContext](Components.md#testing)
