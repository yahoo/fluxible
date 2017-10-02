# Change Log

## 0.2.14

* [#566] Support React 16

## 0.2.13

* [#548] Move create-react-class to devDeps

## 0.2.12

* [#535] Replaced `isMounted()` with flags (@geta6)

## 0.2.11

### Features

* [#531] Add prop-types for React 15.5 support

## 0.2.10

### Features

* [#530] Add create-react-class for React 15.5 support

## 0.2.9

### Features

 * [#510] Expose WrappedComponent from StoreConnector

## 0.2.8

### Bug Fixes

 * [#402] createElementWithContext: Fixed automatic wrapping of top level component with `provideContext` if not
 already wrapped

## 0.2.7

### Features

 * [#399] HoC displayNames now use `wrapper(componentName)` format name instead of suffix for more clear component
 hierarchies

## 0.2.6

### Features

 * [#390] Support for React 15

## 0.2.5

### Bug Fixes

 * [#380] Allow `customContextTypes` to be passed to `connectToStores` when used as a decorator

## 0.2.4

### Bug Fixes

 * [#378] Allow stateless functional components to be wrapped with higher-order components

## 0.2.3

### Enhancements

 * [#344] Convert createClass calls to React.Component classes where possible; Remove autobinding otherwise

### Bug Fixes

 * [#357] Consistently use the public API for `Store` in `connectToStores` and `FluxibleMixin`

## 0.2.2

This release was to fix a packaging issue in npm.

## 0.2.1

### Bug Fixes

 * [#322] Renamed FluxibleMixin's internal property from `listeners` to `_listeners` to avoid naming collisions

### 0.2.0

### Breaking Changes

 * Upgraded to React 0.14, breaking compatibility with older versions of React
 * Removed dependency on `Object.assign` library, must be polyfilled

## 0.1.8

### Bug Fixes

 * Expose batchUpdatePlugin from default exports

## 0.1.7

### Features

 * [#21] Add batch update plugin that will batch all setState calls within the same dispatch

### Internal

 * [#22] Updated object-assign dependency
 * [#23] Updated dev dependencies


## 0.1.6

### Bug Fixes

 * [#9] Fixes calling stateGetter when component receives new props

## 0.1.5

### Bug Fixes

 * [#10] Update fluxible dep and remove unused dep

## 0.1.4

### Bug Fixes

 * Update fluxible version

## 0.1.3

### Bug Fixes

 * Allow pre-release versions of fluxible

## 0.1.2

### Bug Fixes

 * [#2] Remove circular dependency with fluxible
 * [#3] Add backwards dependency for old connectToStores with deprecation notices
 * [#4] Fix documentation links

## 0.1.1

### Bug Fixes

 * [#1] Loosen fluxible dependency

## 0.1.0

 * Init commit
