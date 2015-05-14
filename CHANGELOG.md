# Change Log

## 0.4.8

### Bug Fixes

 * [#162] Fixed issue with 'catch' usage in IE<9

## 0.4.7

### Bug Fixes

 * [#156] Fixed issue with connectToStores calling setState after componentWillUnmount has been called

## 0.4.6

### Bug Fixes

 * [#144] Fixed issue with context prop not being provided to child of `FluxibleComponent`

## 0.4.5

### Bug Fixes

 * Fix undefined error on first `executeAction` in context

## 0.4.4

### Bug Fixes

 * [#141] Fixed `executeAction` not behaving asynchronously - @bruderstein
 * [#142] Fixed issue with `FluxibleComponent` double rendering - @antonklava

## 0.4.3

### Features

 * [#117] Add option to pass function to connectToStores which receives access to all stores

### Bug Fixes

 * [#120] Fixed component action handler errors being swallowed - @cesarandreu

## 0.4.2

### Bug Fixes

 * [#115] Moved factory warning to context.createElement since it's only relevant when using this method

## 0.4.1

### Bug Fixes

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

### Internals

 * Updated to dispatchr 0.3.x
 * Tests now use Babel instead of node-jsx

## 0.3.3

### Bug Fixes

 * [#89] Fixed unintentional payload coercion in `executeAction`

## 0.3.2

### Features

 * [#93] Allow context plugins' rehydrate method to be asynchronous

## 0.3.1

### Features

 * `React.createFactory` no longer needs to be called on your component before passing it in to Fluxible

## 0.3.0

### Features

 * `FluxibleContext.createElement()` now wraps component with `FluxibleComponent` to provide child context correctly

### Breaking Changes

 * React dependency pinned to 0.13

### Deprecations

 * `require('fluxible').Mixin` deprecated, moved to `require('fluxible').FluxibleMixin`
 * `require('fluxible/utils/BaseStore')` deprecated, moved to `require('fluxible/addons/BaseStore')`
 * `require('fluxible/utils/createStore')` deprecated, moved to `require('fluxible/addons/createStore')`

## 0.2.10

### Features

 * [#93] Allow context plugins' rehydrate method to be asynchronous

## 0.2.9

### Features

 * [#63] Added `FluxibleComponent` for wrapping app level component to provide child context

## 0.2.8

### Features

 * [#62] Support for React 0.13

## 0.2.6 - 0.2.7

### Features

 * [#58] Add ability to provide a component action handler in case errors get passed all the way up the action change

## 0.2.5

### Deprecations

 * `appComponent` renamed to `component` in Fluxible constructor

## 0.2.4

### Features

 * [#53] Use `action.displayName` if specified in debug logs (for debugging minified code)

## 0.2.3

### Features

 * [#52] `FluxibleMixin` now specifies `childContextTypes` and `getChildContext` in preparation for React 0.13 which will deprecate `React.withContext`

### Internals

 * [#47] devDependency upgrades

## 0.2.2

### Bug Fixes

 * Fix `MockComponentContext` not working with React context

## 0.2.1

### Features

 * Add `import {FluxibleMixin} from 'fluxible';` for better ES6 support instead of `import {Mixin} from 'fluxible';`

## 0.2.0

### Features

 * Full support for using React's context instead of passing `context` prop to all components

### Breaking Changes

 * `require('fluxible').StoreMixin` renamed to `require('fluxible').Mixin` since it includes more than just store listening

## 0.1.5

### Bug Fixes

 * [#22] Pass a `MockActionContext` to `MockComponentAction.executeAction` calls

## 0.1.4

### Bug Fixes

 * [#21] Pass noop to `MockActionContext.executeAction` to prevent `undefined is not a function` errors

## 0.1.3

### Internals

 * Update dependencies

## 0.1.2

### Internals

 * Update dependencies

## 0.1.1

### Bug Fixes

 * Fixed invalid require in `MockActionContext`

## 0.1.0

First version.
