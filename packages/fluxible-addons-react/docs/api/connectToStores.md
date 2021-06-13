# connectToStores

```js
import { connectToStores } from 'fluxible-addons-react;
```

`connectToStores` is a higher-order component that provides a
convenient way to access state from the stores from within your
component. It takes care of listening to the stores and updating the
wrapped component.

In order to make `connectToStores` to work, the fluxible component
context must be available in the React context. It is recommended to
use [`provideContext`](provideContext.md) around your top level
component to do this for you.

Takes the following parameters:

 * `Component` - the component that should receive the state as props
 * `stores` - array of store constructors to listen for changes
 * `getStateFromStores` - function that receives all stores and should
   return the full state object. Receives Fluxible component context
   the component `props` as arguments
 * `options` (*optional*) - an object with configuration to tweak
   `connectToStores` behavior
 * `options.forwardRef` (*optional*) - a boolean that controls if a
   ref should be forwarded to the wrapped component. Default is false.

## Example

The following example will listen to changes in `FooStore` and
`BarStore` and pass `foo` and `bar` as props to the `Component` when
it is instantiated.

```js
const Component = (props) => (
  <ul>
    <li>{props.foo}</li>
    <li>{props.bar}</li>
  </ul>
);

const stores = [FooStore, BarStore];

const getStateFromStores = (context, props) => ({
  foo: context.getStore(FooStore).getFoo(),
  bar: context.getStore(BarStore).getBar(),
});

export default connectToStores(Component, stores, getStateFromStores);
```

### forwardRef

If you need to pass a ref to the wrapped component, you can set
`forwardRef` option to true.

```js
const Component = React.forwardRef((props, ref) => (
  <ul ref={ref}>
    <li>{props.foo}</li>
    <li>{props.bar}</li>
  </ul>
));

const stores = [FooStore, BarStore];

const getStateFromStores = (context, props) => ({
  foo: context.getStore(FooStore).getFoo(),
  bar: context.getStore(BarStore).getBar(),
});

const options = { forwardRef: true };

export default connectToStores(Component, stores, getStateFromStores, options);
```
