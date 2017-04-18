# provideContext

```js
import provideContext from 'fluxible-addons-react/provideContext';
```

`provideContext` wraps the `Component` with a higher-order component that 
specifies the child context for you. This allows the React context to propagate 
to all children that specify their `contextTypes`.

Receives the following parameters:

 * `Component`: the component to wrap, typically your top-level application 
component, optional if using decorator pattern
 * `customContextTypes`: additional `childContextTypes` to add; useful for 
plugins that add to the component context

By default, the `executeAction` and `getStore` methods will be added to the 
child context and `customContextTypes` will be merged with these defaults.

## Example

The most typical and basic usage of `provideContext` is to wrap your 
Application component to ensure that it receives the `getStore` and 
`executeAction` methods.

```js
class Application extends React.Component {
    render() {
        ...
    }
}
Application = provideContext(Application);
export default Application;
```

Now when you render the Application component, you can pass in the component 
context via the `context` prop and be assured that all children will have 
access to it by specifying the respective `contextType`.

```js
ReactDOM.renderToString(<Application context={context} />);
```

If you're using the 
[`createElementWithContext()` method](createElementWithContext.md) and you 
passed a higher-order `provideContext` component to the Fluxible constructor, 
then the `context` prop will automatically be passed in for you.

### Plugins and Custom Component Context

Since plugins have the ability to add new methods or properties to the 
component context, you can specify custom `childContextTypes` through the 
second parameter.

```js
Application = provideContext(Application, {
    foo: PropTypes.string
});
```

### Decorator

***Decorators are an evolving proposal and should be used with caution
as the API may change at any point. Decorator support in
fluxible-addons-react was built against Babel 5's implementation of
decorators. As of Babel 6, support for decorators has been removed although
third party transforms have been attempted with limited success.

Decorators are also only proposed for classes and properties and therefore
will not work with stateless functional components. See
[decorator pattern](https://github.com/wycats/javascript-decorators) for
more information on the proposal.***

```js
@provideContext({
    foo: PropTypes.string
})
class Application extends React.Component {
    render() {
        ...
    }
}
export default Application;
```
