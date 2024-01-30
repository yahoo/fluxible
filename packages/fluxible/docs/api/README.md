# API Documentation

[`Fluxible`](Fluxible.md) exports the following:

```js
import Fluxible from 'fluxible';
```

While building your application, you will need to build [stores](Stores.md), [actions](Actions.md) and connect them to your [components](Components.md).

Occasionally you may find that you need to use [plugins](Plugins.md) to extend Fluxible's interfaces.

## Addons

FluxibleAddons provides helper utilities for creating stores:

* [`FluxibleAddons.BaseStore`](addons/BaseStore.md)
* [`FluxibleAddons.createStore`](addons/createStore.md)

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

* [`FluxibleAddons.connectToStores`](../../../../packages/fluxible-addons-react/docs/api/connectToStores.md)
* [`FluxibleAddons.FluxibleComponent`](../../../../packages/fluxible-addons-react/docs/api/FluxibleComponent.md)
* [`FluxibleAddons.FluxibleMixin`](../../../../packages/fluxible-addons-react/docs/api/FluxibleMixin.md)
* [`FluxibleAddons.provideContext`](../../../../packages/fluxible-addons-react/docs/api/provideContext.md)

```js
import { connectToStores, FluxibleComponent, FluxibleMixin, provideContext } from 'fluxible-addons-react';
```

These libraries are not bundled with Fluxible to allow for Fluxible usage with
other view libraries such as React Native.

## Utils

Fluxible also provides the following utilities for testing your components:

* [createMockActionContext](Actions.md#testing)
* [createMockComponentContext](Components.md#testing)
