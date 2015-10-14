# Upgrade Guide

## `1.0.0`

### React addons removed from Fluxible

All previously deprecated React integrations have been removed. See notes 
from `0.5.0` on migration to `fluxible-addons-react`. Additionally, 
`require('fluxible').contextTypes` has been removed and will be part of
`fluxible-addons-react`.

### `componentActionHandler` renamed to `componentActionErrorHandler`

This has been renamed to reflect that it is only called when an error occurs.

### Promise library dependency removed

In keeping up-to-date with ES2015, the dependency on `es6-promise` and
`object-assign` libraries have been removed. Users should now add their 
own polyfills to their application in browsers that do not support 
these features yet. We recommend using [Babel](https://babeljs.io/).

## `0.5.0`

### React addons moved to fluxible-addons-react

The React addons have been broken out into a separate package called [fluxible-addons-react](https://github.com/yahoo/fluxible-addons-react). This was done to faciliate the use of Fluxible with other view libraries like React Native.

Your application should depend on `fluxible-addons-react` directly and require the addons from that package.

Note the new way to requre these with es6 uses curly braces:

```js
import {connectToStores} from 'fluxible-addons-react';
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
