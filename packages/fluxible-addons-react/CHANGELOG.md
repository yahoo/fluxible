# Change Log

## 0.2.1

## Bug Fixes

 * [#322] Renamed FluxibleMixin's internal property from `listeners` to `_listeners` to avoid naming collisions

## 0.2.0

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
