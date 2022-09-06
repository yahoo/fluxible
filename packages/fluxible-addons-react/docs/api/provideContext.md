# provideContext

```js
import { provideContext } from 'fluxible-addons-react';
```

`provideContext` is a higher-order component that takes the Fluxible
component contest as prop and provides it to all children of the
wrapped component.

By default, the `executeAction` and `getStore` methods will be
available in addition to any thing provided by Fluxible plugin that
you have configured.

## Example

The most typical and basic usage of `provideContext` is to wrap your
Application component to ensure that it receives the `getStore` and
`executeAction` methods.

```js
const Application = () => {
  return <div>...</div>;
}

export default provideContext(Application);
```

Now when you render the Application component, you can pass in the
component context via the `context` prop and be assured that all
children will have access to through
[`useFluxible`](./useFluxible.md),
[`withFluxible`](./withFluxible.md) or
[`connectToStores`](./connectToStores.md).

```js
ReactDOM.renderToString(<Application context={context} />);
```

If you're using the [`createElementWithContext()`
function](createElementWithContext.md) and you passed a higher-order
`provideContext` component to the Fluxible constructor, then the
`context` prop will automatically be passed in for you.
