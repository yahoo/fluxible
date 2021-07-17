# batchedUpdatePlugin

```js
import { batchedUpdatePlugin } from 'fluxible-addons-react;
```

`batchedUpdatePlugin` is a Fluxible plugin that will batch React
`setState` calls together when they are part of the same
`dispatch`. This can improve performance as there will be fewer
re-renders for components that listen to multiple stores that react to
the same dispatch command.

## Example

The plugin is added to Fluxible immediately after instantiation as
follows:

```js
const app = new Fluxible();
app.plug(batchedUpdatePlugin());
```

This will wrap the `actionContext.dispatch` function with a call to
`ReactDOM.unstable_batchedUpdates`.
