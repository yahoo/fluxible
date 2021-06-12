# useFluxible

```js
import { useFluxible } from 'fluxible-addons-react';
```

`useFluxible` is a React hook that returns the Fluxible component
context.

## Example

```js
const Component = () => {
    const { executeAction } = useFluxible();

    return <button onClick={() => executeAction(myAction)} />;
  }
}
```
