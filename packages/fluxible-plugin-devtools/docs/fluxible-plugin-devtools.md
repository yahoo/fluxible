# Dev Tools Plugin API

## Enable

To enable the devtools, you need to pass in a `debug` feature flag into the `app.createContext` method.

## `devtools` namespace

`context` and `componentContext` are extended with a `devtools` namespace with some some methods.

 * `componentContext.devtools.getActionHistory()`: Returns an array of top level actions that were executed. Every action has a children property which contains an array of child actions. This output can be used in conjunction with the `ActionTree` component.

