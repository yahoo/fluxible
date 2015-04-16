# `connectToStores(Component, stores, storeGetters)`

```js
import connectToStores from 'fluxible/addons/connectToStores';
```

`connectToStores` is a higher-order component that provides a convenient way to access state from the stores from within your component. It takes care of defining `getInitialState` and listening to the stores for updates. The store state will be sent to the `Component` instance as props. It is required that the React context is set and has access to `getStore`. It is recommended to use [`provideContext`](provideContext.md) around your top level component to do this for you.

Takes the following parameters:

 * `Component` - the component that should receive the state as props
 * `stores` - array of store constructors to listen for changes
 * `getStateFromStores` - function that receives all stores and should return the full state object. Receives `stores` hash and component `props` as arguments

## Example

The following example will listen to changes in `FooStore` and `BarStore` and pass `foo` and `bar` as props to the `Component` when it is instantiated.

```js
class Component extends React.Component {
    render() {
        return (
            <ul>
                <li>{this.props.foo}</li>
                <li>{this.props.bar}</li>
            </ul>
        );
    }
}

Component = connectToStores(Component, [FooStore, BarStore], function (stores, props) {
    return {
        foo: stores.FooStore.getFoo(),
        bar: stores.BarStore.getBar()
    };
});

module.exports = Component;
```
