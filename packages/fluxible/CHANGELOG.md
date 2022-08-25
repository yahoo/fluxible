# fluxible

## 1.4.0

### Minor Changes

 * [#537] Add config to allow removing second setImmediate wrapper around callback during action execution, so that there is less artifial yielding for most of the normal cases where callback function executes successfully with no exception.

## 1.3.0

### Minor Changes

 * [#494] Remove setImmediate from rehydration promise

## 1.2.0

### Minor Changes

 * Upgraded dispatchr dependency to 1.0.0. This version of dispatchr defers rehydration
 to when a store is instantiated rather than immediately upon `rehydrate` call.

## 1.1.0

### Minor Changes

 * [#418] Added `plugExecuteAction` hook to plugin API to allow tracking of execute calls

## 1.0.5

### Patch Changes

 * [#409] Fixed setImmediate polyfill not being installed before being used

## 1.0.4

### Patch Changes

 * [#374] Fixed inconsistent `MockActionContext.executeAction` behavior. Tests that incorrectly depend on synchronous 
 execution may break. See https://gist.github.com/mridgway/4d66eb1d3277d8b442f2 for more details.

## 1.0.3

### Patch Changes

 * [#308] Fix stack tracing for deep stacks

## 1.0.1

### Minor Changes

 * [#295] Added support for Promises in MockActionContext

## 1.0.0

### API Changes

 * [#257] All previously deprecated React integration APIs have been removed
 * [#259] `componentActionHandler` renamed to `componentActionErrorHandler`
 * [#258] Removed dependency on `Promise` and `Object.assign` library, must be polyfilled

## 0.5.6

### Patch Changes

 * [#308] Fix stack tracing for deep stacks

## 0.5.5

### Patch Changes

 * [#276] Lock down fluxible-addons-react dependency for React 0.13

## 0.5.4

### Patch Changes

 * [#269] Fixed binding of executeAction to actionContext

## 0.5.3

### Minor Changes

 * [#263] Action tracing: added `actionContext.id` and `actionContext.stack`

## 0.5.2

### Patch Changes

 * [#249] Updated `es6-promise`, `chai`, and `eslint` dependencies
 * [#248] Updated `object-assign` dependency

## 0.5.1

### Patch Changes

 * [#217] Fix warn message `createElement` to `createElementWithContext`

## 0.5.0

### Minor Changes

 * [#147] `connectToStores` and `provideContext` can now be used as decorators

### Deprecations

 * [#202] Addons were moved to a separate package ([fluxible-addons-react](https://github.com/yahoo/fluxible-addons-react)) to support other view libraries like React Native. A warning will be displayed when requiring the addons from this package. They will be removed in the next breaking change version.
 * `connectToStores`'s `getStateFromStores` signature has changed to `(context, props)`.

## 0.4.12

### Patch Changes

 * [#197] Fixed issue where plugins were called with undefined during rehydration

## 0.4.11

### Patch Changes

 * [#195] Fixed undefined error with rehydrating with an empty state object

### Minor Changes

 * [#196] Added `getStore` method to `FluxibleContext` class

## 0.4.10

### Patch Changes

 * [#174] `MockActionContext.executeAction` now returns the result of the action properly - @ross-pfahler
 * [#175] Better protection for plugin's `plugContext` method returning undefined - @cesarandreu
 * [#176] Non-react specific statics on components will now be hoisted to the higher-order component wrappers

## 0.4.9

### Minor Changes

 * [#165] Export `fluxible/utils/MockActionContext` and `fluxible/utils/MockComponentContext` classes
 to make it easier to extend the classes for testing custom plugin functionality.

### Patch Changes

* [#164] Fixed the `connectToStores` functionality in minified environments as long as users specify a `storeName` static property.

## 0.4.8

### Patch Changes

 * [#162] Fixed issue with 'catch' usage in IE<9

## 0.4.7

### Patch Changes

 * [#156] Fixed issue with connectToStores calling setState after componentWillUnmount has been called

## 0.4.6

### Patch Changes

 * [#144] Fixed issue with context prop not being provided to child of `FluxibleComponent`

## 0.4.5

### Patch Changes

 * Fix undefined error on first `executeAction` in context

## 0.4.4

### Patch Changes

 * [#141] Fixed `executeAction` not behaving asynchronously - @bruderstein
 * [#142] Fixed issue with `FluxibleComponent` double rendering - @antonklava

## 0.4.3

### Minor Changes

 * [#117] Add option to pass function to connectToStores which receives access to all stores

### Patch Changes

 * [#120] Fixed component action handler errors being swallowed - @cesarandreu

## 0.4.2

### Patch Changes

 * [#115] Moved factory warning to context.createElement since it's only relevant when using this method

## 0.4.1

### Patch Changes

 * Fixed context plugin rehydration throwing undefined error

## 0.4.0

### New Features

 * [#69] `executeAction` and plugins now support Promises: returns Promise and allows Promise to be returned from action
 * [#70] `connectToStores` higher order component for listening to state changes
 * [#107] `provideContext` higher order component for setting child context on top level component
 * New `require('utils/createMockActionContext')` with simpler API to replace `MockActionContext`
 * New `require('utils/createMockComponentContext')` with simpler API to replace `MockComponentContext`

### Breaking Changes

 * removed `require('fluxible').Mixin`
 * removed `require('fluxible/utils/MockActionContext')`
 * removed `require('fluxible/utils/MockComponentContext')`

### Deprecations

 * [#100] It is no longer necessary to pass component factories to Fluxible constructor, instead just pass the component class
 * `require('fluxible').FluxibleComponent` has moved to `require('fluxible/addons/FluxibleComponent')`
 * `require('fluxible').FluxibleMixin` has moved to `require('fluxible/addons/FluxibleMixin')`

### Documentation

 * Moved addons to their own document and added recommendations on which ones to use when there are options

### Patch Changes

 * Updated to dispatchr 0.3.x
 * Tests now use Babel instead of node-jsx

## 0.3.3

### Patch Changes

 * [#89] Fixed unintentional payload coercion in `executeAction`

## 0.3.2

### Minor Changes

 * [#93] Allow context plugins' rehydrate method to be asynchronous

## 0.3.1

### Minor Changes

 * `React.createFactory` no longer needs to be called on your component before passing it in to Fluxible

## 0.3.0

### Minor Changes

 * `FluxibleContext.createElement()` now wraps component with `FluxibleComponent` to provide child context correctly

### Breaking Changes

 * React dependency pinned to 0.13

### Deprecations

 * `require('fluxible').Mixin` deprecated, moved to `require('fluxible').FluxibleMixin`
 * `require('fluxible/utils/BaseStore')` deprecated, moved to `require('fluxible/addons/BaseStore')`
 * `require('fluxible/utils/createStore')` deprecated, moved to `require('fluxible/addons/createStore')`

## 0.2.10

### Minor Changes

 * [#93] Allow context plugins' rehydrate method to be asynchronous

## 0.2.9

### Minor Changes

 * [#63] Added `FluxibleComponent` for wrapping app level component to provide child context

## 0.2.8

### Minor Changes

 * [#62] Support for React 0.13

## 0.2.6 - 0.2.7

### Minor Changes

 * [#58] Add ability to provide a component action handler in case errors get passed all the way up the action change

## 0.2.5

### Deprecations

 * `appComponent` renamed to `component` in Fluxible constructor

## 0.2.4

### Minor Changes

 * [#53] Use `action.displayName` if specified in debug logs (for debugging minified code)

## 0.2.3

### Minor Changes

 * [#52] `FluxibleMixin` now specifies `childContextTypes` and `getChildContext` in preparation for React 0.13 which will deprecate `React.withContext`

### Patch Changes

 * [#47] devDependency upgrades

## 0.2.2

### Patch Changes

 * Fix `MockComponentContext` not working with React context

## 0.2.1

### Minor Changes

 * Add `import {FluxibleMixin} from 'fluxible';` for better ES6 support instead of `import {Mixin} from 'fluxible';`

## 0.2.0

### Minor Changes

 * Full support for using React's context instead of passing `context` prop to all components

### Breaking Changes

 * `require('fluxible').StoreMixin` renamed to `require('fluxible').Mixin` since it includes more than just store listening

## 0.1.5

### Patch Changes

 * [#22] Pass a `MockActionContext` to `MockComponentAction.executeAction` calls

## 0.1.4

### Patch Changes

 * [#21] Pass noop to `MockActionContext.executeAction` to prevent `undefined is not a function` errors

## 0.1.3

### Patch Changes

 * Update dependencies

## 0.1.2

### Patch Changes

 * Update dependencies

## 0.1.1

### Patch Changes

 * Fixed invalid require in `MockActionContext`

## 0.1.0

First version.
