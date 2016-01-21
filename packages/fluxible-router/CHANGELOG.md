# Change Log

## 0.4.5

### Features

 * [#360] Allow navParams to be overwritten by overwriteSpec (snyamathi)

## 0.4.4

### Bug Fix

 * [#354] currentRoute is no longer immutable (gingur)

## 0.4.3

### Features

 * [#348] Added getRoute(url, options) to RouteStore (kfay)

## 0.4.2
Deprecated, published package was corrupted

## 0.4.1

### Features

 * [#107] Fix "nav.params is not an object" error (geta6)

## 0.4.0

### Features

 * [#102] Immutable.js dependency has been removed to reduce k-weight
 * [#103] Navigation uses transaction IDs to ensure correct handling of success/failure
 * [#104] Router instance with static routes is reused between requests

## 0.3.2

### Features

 * [#99] Fix rehydrate store for POST routes (andersonba)

## 0.3.1

### Features

 * [#97] Add handling for pre-render popstate events

## 0.3.0

### Breaking Changes

 * Upgraded to React 0.14, breaking compatibility with older versions of React
 * Removed dependency on `Object.assign` library, must be polyfilled
 
### Features

 * [#69] Add NavLink `activeElement` option to use another element type for active state

## 0.2.0

### Features

 * Higher-order components can now be used as decorators

### Breaking Changes

 * Now requires Fluxible@>=0.5.x

## 0.1.0

First version.
