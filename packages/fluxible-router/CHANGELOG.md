# Change Log

## 2.0.0

* Remove `debug` as dependency [#714]
* Add es build to npm package [#710]
* Move `addons/HistoryWithHash` to the root folder [#710]
* Remove `wrappedElement` ref from `handleHistory` and `handleRoute` [#696]
* Update `fluxible-addons-react` to 1.0.0 [#667]

## 1.4.0

* [#566] Support React 16

## 1.3.0

* [#535] Replaced `isMounted()` with flags (@geta6)

## 1.2.0

### Features

* [#531] Add prop-types for React 15.5 support

## 1.1.0

### Features

* [#530] Add create-react-class for React 15.5 support

## 1.0.1

### Enhancement

* [#527] Skip document title update when it is not changed (@alexparish)

## 1.0.0

### Features

* Full release of v1.0.0. Please read the [upgrade guide](UPGRADE.md#04x-to-1x) for more information on the API changes.

## 1.0.0-alpha.9

### Features

* [#516] Skip updating scroll when it is not changed

## 1.0.0-alpha.8

### Features

 * [#510] Expose WrappedComponent from StoreConnector

## 1.0.0-alpha.7

### Features

 * [#503] Allow custom props to be added to filtered ones

## 1.0.0-alpha.6

### Features

 [#497] Backport 0.4.x features

 * [#478] move href checking logic into isRoutable() to simplify dispatchNavAction()
    (cherry picked from commit 5ae07b7feb1a2d92c82c47bcae3f80dcbb029359)
 * add saveScrollInState param
    (cherry picked from commit cd1a41902b89f2f71932317f9ee587006269fa25)
 * add href to component state

## 1.0.0-alpha.5

### Bug Fixes

 * [#453] Fix warnings for unknown props in React 15.2

## 1.0.0-alpha.4

### Breaking Changes

 * [#417] Updates to routr 2.0.0. `getRoute` will now `decodeURIComponent` route values, you might need to remove `decodeURIComponent` from your route actions if you were supporting extended characters manually in your routes.

## 1.0.0-alpha.3

### Bug Fixes

 * [#414] Send correct payload to NAVIGATE_FAILURE
 * [#413] Support query in navigateAction when not using full URL

## 1.0.0-alpha.2

### Bug Fixes

 * [#412] Fixed style property in NavLink when inactive

## 1.0.0-alpha.1

### Breaking Changes

See the [upgrade guide](UPGRADE.md#04x-to-1x)

 * Default `activeClass` prop has been removed
 * `route` object no longer contains `navigate` key. `navigate` can be accessed via `routeStore.getCurrentNavigate()`
 * `NAVIGATE_SUCCESS` and `NAVIGATE_FAILURE` payloads are now the `navigate` object which contains a `route` key to
 access the current route.

### Features

 * Performance improvements:
 ** `NavLink` will only listen to the `RouteStore` if an `active*` property is used.
 ** `NavLink` will no longer compute active state on all prop/state changes, only when `currentRoute` or `prop` has
 changed.
 * [#397] NavLink now supports query parameters via the `queryParams` property

## 0.4.16

### Bug Fixes

 * [#453] Fix warnings for unknown props in React 15.2

## 0.4.15

### New Feature

 * [#450] add saveScrollInState param, by @Diokuz

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
