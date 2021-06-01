# Migration guides

## From 0.2.x to 1.0.0

### imports

Since the published version is a babel transpiled code that resides on
a dist folder, imports like `fluxible-addons-react/connectToStores`
don't work anymore.

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

`provideContext(Component, customContextTypes)` -> `provideContext(Component)`

Since the new React API doesn't rely on PropTypes anymore, there is no
need to pass an object with context types in order to forward plugins
context to the components.

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
provideContext(Component)
```

If you were using `provideContext` to provide other context data not
related to fluxible itself, you will need to provide your own
solution to achieve the same result as before.

#### Ref support removed

This hoc does not include `wrappedComponent` ref anymore.

### connectToStores

`connectToStores(Component, stores, getStateFromStores, customContextTypes)` -> `connectToStores(Component, stores, getStateFromStores, options)`

Since the new React API doesn't rely on PropTypes anymore, there is no
need to specify the `customContextTypes` param to extract plugins
context from the fluxible context. All plugins component context are
available.

**Before:**

```javascript
const customContextTypes = {
    pluginBar: PropTypes.string,
    pluginFoo: PropTypes.object
};

connectToStores(Component, stores, getStateFromStores, customContextTypes)
```

**After:**

```javascript
connectToStores(Component, stores, getStateFromStores)
```

#### Ref support improved

`connectToStores` now returns a `React.forwardRef` component instead
of internally attaching the `wrappedComponent` ref to the wrapped
component. This means that you can now pass a ref to the connected
component that it will be forwarded to the wrapped component.

However, in order to have your prop forwarded, you need to explicitly
tell it to `connectToStores` by setting `forwardRef` to `true` in the
`options` param.


**Before**
```javascript
// Only class components would get access to a ref
class CustomInput extends React.Component {
    constructor() {
        this.ref = React.createRef();
    }

    render() {
        return <input ref={this.ref} {...this.props} />
    }
}

const ConnectedInput = connectToStores(CustomInput, stores, getStateFromStores);

class App extends React.Component {
    constructor() {
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.ref.current.wrappedComponent.ref.current.focus()
    }

    render() {
        return <ConnectedInput ref={this.ref} />
    }
}
```

**After**
```javascript
// Besides classes, it's now possible to forward refs to functional components.
const CustomInput = React.forwardRef((props, ref) => <input ref={ref} {...props} />);

const ConnectedInput = connectToStores(
    CustomInput,
    stores,
    getStateFromStores,
    { forwardRef: true }
);

class App extends React.Component {
    constructor() {
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.ref.current.focus()
    }

    render() {
        return <ConnectedInput ref={this.ref} />
    }
}
```
