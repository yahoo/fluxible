# withFluxible

```js
import { withFluxible } from 'fluxible-addons-react';
```

`withFluxible` is a higher-order component that injects Fluxible
component context into your component through the `context` props.

## Example

```js
class Component extends React.Component {
  render() {
    const { context } = this.props;

    return (
      <button onClick={() => context.executeAction(myAction)} />
    );
  }
}

export default withFluxible(Component);
```
