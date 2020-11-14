# Migration guides

## From 0.2.x to 1.0.0

### imports

Since the published version is a babel transpiled code that resides on a 
dist folder, imports like `fluxible-addons-react/connectToStores` don't work anymore.

**Before**

```javascript
import connectToStores from 'fluxible-addonts-react/connectToStores';
import provideContext from 'fluxible-addonts-react/provideContext';
// ...
```

**After**

```javascript
import { connectToStores, provideContext } from 'fluxible-addonts-react';
```

### provideContext

`provideContext(Component, customContextTypes)` -> `provideContext(Component, plugins)`

Since the new React API doesn't rely on PropTypes anymore, a list of
plugins keys is enough to tell fluxible which custom data you would
like to have available inside fluxible context.

**Before:**

```javascript
const customContextTypes = {
    pluginBar: PropTypes.string,
    pluginFoo: PropTypes.object
}

provideContext(Component, customContextTypes)
```

**After:**

```javascript
const plugins = ['pluginBar', 'pluginFoo'];

provideContext(Component, plugins)
```

If you were using `provideContext` to provide other context data not
related to fluxible itself, you will need to provide your own
solution to achieve the same result as before.

### connectToStores

`connectToStores(Component, stores, getStateFromStores, customContextTypes)` -> `connectToStores(Component, stores, getStateFromStores)`

Since the new React API doesn't rely on PropTypes anymore, there is no
need to specify customContextTypes to extract from the fluxible
context. The context available to your `getStateFromStores` will
contain all the custom data specified in `provideContext`.

**Before:**

```javascript
const customContextTypes = {
    pluginBar: PropTypes.string,
    pluginFoo: PropTypes.object
};

connectToStores(Component, customContextTypes)
```

**After:**

```javascript
connectToStores(Component)
```

If you were relying in other contextTypes that were not included in
`provideContext` (non fluxible plugins), you will need to find another
way to have it available in `getStateFromStores`. Since the second
argument of `getStateFromStores` is props passed to the wrapped
component, you can create your own high order component that passes
the required context as props to your connected component:

```javascript
const customContextTypes = {
    foo: PropTypes.string,
    bar: PropTypes.object
};

export default injectContext(customContextTypes, connectToStores(Component));
```

You can read more about how to create your own high order components
at React [official documentation](https://reactjs.org/docs/higher-order-components.html).
