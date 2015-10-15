# createElementWithContext(context, props)

```js
import createElementWithContext from 'fluxible-addons-react/createElementWithContext';
```

Convenience method for instantiating the Fluxible app's top level React 
component (if provided in the constructor) with the given props with an 
additional `context` key containing a ComponentContext. 

```js
const app = new Fluxible({
    component: MyComponent
});
const context = app.createContext();
const markup = ReactDOM.renderToString(createElementWithContext(context, props));
```

This is the same as the following:

```js
const markup = ReactDOM.renderToString(
    <FluxibleComponent context={context.getComponentContext()}>
        <MyComponent ...props />
    </FluxibleComponent>
);
```
