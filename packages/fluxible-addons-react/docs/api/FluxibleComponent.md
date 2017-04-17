# FluxibleComponent

```js
import FluxibleComponent from 'fluxible-addons-react/FluxibleComponent';
```

The `FluxibleComponent` is a wrapper component that will provide all of its children with access to the Fluxible component
context via React's `childContextTypes` and `getChildContext`. This should be used to wrap your top level component. It provides access to the methods on the [component context](../../../../packages/fluxible/docs/api/Components.md#component-context).

 You can get access to these methods by setting the correct `contextTypes` within your component or including the [`FluxibleMixin`](./FluxibleMixin.md) which will add them for you.

## Usage

If you have a component that needs access to the [`ComponentContext`](../../../../packages/fluxible/docs/api/Components.md#component-context) methods:

 ```js
class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.context.getStore(FooStore).getState();
    }
}
Component.contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired
};
```

you can wrap the component with `FluxibleComponent` to provide the correct context:

```js
let html = ReactDOM.renderToString(
    <FluxibleComponent context={context.getComponentContext()}>
        <Component />
    </FluxibleComponent>
);
```

If you are using [`createElementWithContext`](./createElementWithContext.md) this will happen for you automatically:

```js
let html = ReactDOM.renderToString(createElementWithContext(context));
```
