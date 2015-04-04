# `provideContext(Component, customContextTypes)`

```js
import provideContext from 'fluxible/addons/provideContext';
```

`providesContext` wraps the `Component` with a higher-order component that specifies the child context for you. This allows the React context to propagate to all children that specify their `contextTypes`.

Receives the following parameters:

 * `Component`: the component to wrap, typically your top-level application component
 * `customContextTypes`: additional `childContextTypes` to add; useful for plugins that add to the component context

By default, the `executeAction` and `getStore` methods will be added to the child context and `customContextTypes` will be merged with these defaults.

## Example

The most typical and basic usage of `provideContext` is to wrap your Application component to ensure that it receives the `getStore` and `executeAction` methods.

```js
class Application extends React.Component {
    render() {
        ...
    }
}
Application = provideContext(Application);
export default Application
```

Now when you render the Application component, you can pass in the component context via the `context` prop and be assured that all children will have access to it by specifying the respective `contextType`.

```js
React.renderToString(<Application context={context} />);
```

If you're using the [`FluxibleContext.createElement()` method](../FluxibleContext.md#createelement-props-) and you passed a higher-order `provideContext` component to the Fluxible constructor, then the `context` prop will automatically be passed in for you.

### Plugins and Custom Component Context

Since plugins have the ability to add new methods or properties to the component context, you can specify custom `childContextTypes` through the second parameter.

```js
Application = provideContext(Application, {
    foo: React.PropTypes.string
});
```
