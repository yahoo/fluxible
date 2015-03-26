# FAQ

Frequently asked questions from the community.


## General

### What are the drawbacks of using Fluxible? In contrast to Facebook's Flux library?

It depends on whether you are building a server-side app. Facebook’s Flux only works on the client, but it may be easier to figure out since it doesn’t have to deal with concurrency issues.

### Is there a way to render a reactComponent only client side?

Use the `componentDidMount` lifecycle event to set an internal state that re-renders itself on the client (i.e, `this.state.mounted`).




## Actions

### Can I fire the navigation function manually?

Yes, you can call the [`navigate` action](https://github.com/yahoo/flux-router-component/blob/master/actions/navigate.js) from flux-router-component directly.


## Components

### Should `getStore` and `executeAction` be required in the `contextTypes` of `FluxibleMixin`?

It is not required because we still support passing `context` as a prop to all of the components that need it. This is how things were done before we started using `context`. Some people still prefer this method since React’s `context` is not guaranteed to stay the way it is right now.


## Stores

### Can I call an action from a store?

Right now, it is not possible. This will require some thought on how to ensure that the server can keep track of actions that are executed from stores.




## Data Fetching

### What does the error message "invalid csrf token" from Fetchr mean?

This is caused by the csrf middleware. You need to make sure you pass the `csrf` token to the `createContext` method on the server. Check the server.js of [chat](https://github.com/yahoo/flux-examples/blob/master/chat/server.js#L37) or [todo](https://github.com/yahoo/flux-examples/blob/master/todo/server.js#L41) examples.




## Routing

### Which should I use, `react-router` or `flux-router-component`?

[react-router](https://github.com/rackt/react-router) has some features that flux-router-component does not have, like nested routes, component `willTransitionTo` hooks, and built-in re-directs. If you feel like you do not need them, then you will be fine with flux-router-component. We prefer the flux-like flow, so we use flux-router-component internally.


### In react-router, how do I get access to the Fluxible context from `willTransitionTo`?

Since `willTransitionTo` is defined statically on the component, it will not have access to the Fluxible context. There is a [open issue](https://github.com/rackt/react-router/pull/590) from react-router to provide access but, as of this writing) it has yet to be resolved.


