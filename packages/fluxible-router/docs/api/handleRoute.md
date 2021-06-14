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
import { handleRoute } from 'fluxible-router';

const MyComponent = (props) => {
  // Get the handler from the current route which is passed in as prop
  const Handler = this.props.currentRoute.handler;

  return (
    <div>
      <Handler />
    </div>
  );
};

export default handleRoute(MyComponent);
```
