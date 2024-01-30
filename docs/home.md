# Features

## Singleton-free for server rendering

[Stores](../packages/fluxible/docs/api/Stores.md) are classes that are instantiated per request or client session. This ensures that the stores are isolated and do not bleed information between requests.

## Dehydration/Rehydration

[Stores](../packages/fluxible/docs/api/Stores.md) can provide `dehydrate` and `rehydrate` so that you can propagate the initial server state to the client.

## React Integration

Helper utilities for integrating your Fluxible app into React [components](../packages/fluxible/docs/api/Components.md) with less boilerplate.

## Flow Regulation

[FluxibleContext](../packages/fluxible/docs/api/FluxibleContext.md) restricts access to your Flux methods so that you can't break out of the unidirectional flow.

## Pluggable

Want to add your own interfaces to the Flux flow? [Plugins](../packages/fluxible/docs/api/Plugins.md) allow you to add methods to any of the contexts.

## Updated for Latest React

Updated to follow React's changes and the deprecations coming in the next version of React.
