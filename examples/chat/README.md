# chat

Ported from https://github.com/facebook/flux/tree/master/examples/flux-chat

This shows the full Flux flow from server to client as well as XHR posts for creating new messages so that they are persisted between page loads.

## Usage

Make sure you run `npm install` from the root of flux-examples. Then change directories to chat (`cd chat`) and run:

```bash
$ npm run dev
```

This will use `nodemon` and `webpack` to watch for changes and restart and rebuild as needed.

Open http://localhost:3000

This example also includes different patterns for render and loading data.
 * You can add `?load=0` to defer loading data until the client. A delay of 1 second is added on the client in order to make this more apparent.
 * You can add `?render=0` to defer rendering until the client.
