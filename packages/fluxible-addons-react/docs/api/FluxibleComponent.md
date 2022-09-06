# FluxibleComponent

```js
import { FluxibleComponent } from 'fluxible-addons-react;
```

The `FluxibleComponent` is a wrapper component that will provide all
of its children with access to the Fluxible component context. This
should be used to wrap your top level component. It provides access to
the methods on the [component
context](../../../../packages/fluxible/docs/api/Components.md#component-context).

You can get access to these methods by using [`useFluxible`](./useFluxible.md) hook or
[`withFluxible`](./withFluxible.md) higher-order component.

## Usage

If you have a component that needs access to the
[`ComponentContext`](../../../../packages/fluxible/docs/api/Components.md#component-context)
methods:

 ```js
const Component = () => {
    const context = useFluxible();
    const onClick = () => context.executeAction(myAction);

    return <button onClick={onClick} />
};
```

You can wrap the component with `FluxibleComponent` to provide the
Fluxible component context:

```js
const html = ReactDOM.renderToString(
  <FluxibleComponent context={context.getComponentContext()}>
    <Component />
  </FluxibleComponent>
);
```

If you are using
[`createElementWithContext`](./createElementWithContext.md) this will
happen for you automatically:

```js
const html = ReactDOM.renderToString(createElementWithContext(context));
```
