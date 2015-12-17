# API: `handleRoute`

The `handleRoute` higher-order component handles listening to the [`RouteStore`](RouteStore.md) for changes and passes props to the supplied component.

`handleRoute` is leveraged in the [`handleHistory`](handleHistory.md) higher-order component and also in [`navigateAction`](navigateAction.md).

## Props Passed

These props will be passed to your component when a `RouteStore` change is emitted.

| Prop | Description |
|:-----|:------------|
| `currentNavigate` | The current payload received when `NAVIGATE_START` is dispatched. |
| `currentNavigateError` | An object representing a navigation error. Note: this is not an `Error` object, it will only contain `message` and `statusCode` properties. |
| `isNavigateComplete` | A boolean representing if the `navigateAction` has completed. Set to `true` after `NAVIGATE_SUCCESS` or `NAVIGATE_FAILURE`. |
| `currentRoute` | The config object from the matched route. |
| `isActive` | A shortcut to `RouteStore.isActive`. See: [`RouteStore`](RouteStore.md). |
| `makePath` | A shortcut to `RouteStore.makePath`. See: [`RouteStore`](RouteStore.md). |

## Example Usage

```js
// components/MyComponent.jsx
var handleRoute = require('fluxible-router').handleHistory;

var MyComponent = React.createClass({
    render: function () {
        // Get the handler from the current route which is passed in as prop
        var Handler = this.props.currentRoute.handler;

        return (
            <div>
                <Handler />
            </div>
        );
    }
});

// wrap with route handler
MyComponent = handleRoute(MyComponent);

module.exports = MyComponent;
```

### Decorator Usage

```js
// components/App.jsx
import {provideContext} from 'fluxible-addons-react';
import {handleHistory} from 'fluxible-router';

@handleRoute
class MyComponent extends React.Component {
    //...
}

export default MyComponent;
```
