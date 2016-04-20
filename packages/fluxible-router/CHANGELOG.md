# Change Log

## 0.4.14

### Bug Fixes

 * [#427] Fallback for pushState and replaceState exceptions

## 0.4.13

### Features

 * [#423] Added overridable `getDefaultChildProps` method to `NavLink` spec

## 0.4.12

### Bug Fixes

 * [#421] Fix for scroll state in IE

## 0.4.11

### Features

 * [#396] Add `navigate={true}` property that will check if a route matches before executing `navigateAction`. This
 is useful if you are rendering a NavLink with an href that you are unsure of whether it is an internal or external
 route. (thanks @hfter789)

### Features

## 0.4.10

### Features

 * [#390] Support for React 15
 * [#394] Allow ignoring popstate event on page load
 
### Bug Fixes

 * [#392] Fix stopPropagation not working with modified key presses

## 0.4.9

### Features

 * [#387] Allow `followLink` functionality to be modified by `createNavLinkComponent` spec argument

## 0.4.8

### Bug Fixes

 * [#378] Allow stateless functional components to be wrapped with higher-order components

## 0.4.7

### Bug Fix

 * [#368] Always update currentRoute regardless if the routes match (kaesonho)

## 0.4.6

### Bug Fix

 * [#367] Always set _currentNavigate regardless if the routes match (gfranko)

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
