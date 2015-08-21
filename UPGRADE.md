# Upgrade Guide

## `0.5.0`

### React addons moved to fluxible-addons-react

The React addons have been broken out into a separate package called [fluxible-addons-react](https://github.com/yahoo/fluxible-addons-react). This was done to faciliate the use of Fluxible with other view libraries like React Native.

Your application should depend on `fluxible-addons-react` directly and require the addons from that package.

Note the new way to requre these with es6 uses curly braces:

```js
import {connectToStores} from 'fluxible-addons-react’;`
```

### `connectToStores`'s `getStateFromStores` signature has changed to `(context, props)`

Your `connectToStores` should change from:

```js
connectToStores(Component, [MyStore], (stores, props) => {
    return {
        foo: stores.MyStore.getFoo()    
    };
});
```

to

```js
connectToStores(Component, [MyStore], (context, props) => {
    return {
        foo: context.getStore(MyStore).getFoo()    
    };
});
```
