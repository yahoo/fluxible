# Upgrade Guide

## 0.4.x to 1.x

### NavLink's default `activeClass` prop value removed

Previously all `NavLink`s listened the `RouteStore` for changes in order to update their active style/class/element. 
In many cases none of these properties were used, which meant the component was listening unnecessarily. Now 
`NavLink` will only listen if `activeClass`, `activeStyle`, or `activeElement` are explicitly passed in to the 
component.

Code that relied on the `active` class to be automatically added to `NavLink` components will be required to 
explicitly use `<NavLink activeClass='active'>` in order for the link to listen for updates.

### `route.navigate` no longer exists

Code that relied on `route.navigate` will need to access the `navigate` object from `RouteStore.getCurrentNavigate()`
. The ownership of these two objects have been inverted to reflect that a navigation results in a route being matched
rather than the inverse. This allows us to optimize `NavLink` by making `navigate` and `route` immutable and 
recognize that a `navigate` may be triggered, but the `route` doesn't necessarily change.

### `NAVIGATE_SUCCESS` and `NAVIGATE_FAILURE` payload changes

Stores that listen to `NAVIGATE_SUCCESS` and `NAVIGATE_FAILURE` will receive a different payload. These payloads have
been unified across the events. This allows the `RouteStore` to correlate the events with `NAVIGATE_START` using a 
transaction identifier with the changes to the `route` object.

#### `NAVIGATE_SUCCESS`

Previously received the `route` object, but now receives the `navigate` object which contains `navigate.route`.

#### `NAVIGATE_FAILURE`

Previously received an `error` object, but now receives the `navigate` object which contains `navigate.error`.

## 0.3.x to 0.4.x

The `RouteStore`s `currentRoute` is no longer an immutable.js object. 
Instead, the route is a plain object that follows the same structure as defined
in the routes. Any usage of `route.get('foo')` will no longer work and should 
switch to using `route.foo`.

## 0.2.x to 0.3.x

Upgrade React to 0.14. See https://facebook.github.io/react/blog/2015/09/10/react-v0.14-rc1.html

## 0.1.x to 0.2.x

Upgrade Fluxible to 0.5.x.

## `flux-router-component` to `fluxible-router`

Be sure to read the [quick start doc](https://github.com/yahoo/fluxible-router/blob/master/docs/quick-start.md). Here we'll be covering the logistical aspects of updating existing apps.

### No more mixins

The mixin we had in `flux-router-component` has been retired in favor of higher-order components. Once a component is wrapped via `handleRoute` (or `handleHistory` which internally uses `handleRoute`) it will be passed props when navigation actions are triggered. See the [`handleRoute` docs](https://github.com/yahoo/fluxible-router/blob/master/docs/api/handleRoute.md) for details.

### Update `NavLink` imports

If you have imports for the `NavLink` from `flux-router-component` you'll need to update them to import from `fluxible-router`.

```js
var NavLink = require('flux-router-component').NavLink;
```

Should now be:

```js
var NavLink = require('fluxible-router').NavLink;
```

### Routes become immutable

When a route is matched and passed to your component it is converted into an [immutable](http://facebook.github.io/immutable-js/) object. It's important to realize you'll need to use the `get` methods to access properties instead of accessing them with regular `.` syntax.

```js
this.props.currentRoute.url
```

Should now be:

```js
this.props.currentRoute.get('url')
```

This also affects actions that are called from `navigateAction`. They will also receive a payload that is the immutable route object:

```js
module.exports = function myAction(context, payload, callback) {
    var params = payload.get('params');
    //...
}
```

### Action name changes

The following action names were changed:

- `CHANGE_ROUTE_START` -> `NAVIGATE_START`
- `CHANGE_ROUTE_SUCCESS` -> `NAVIGATE_SUCCESS`
- `CHANGE_ROUTE_FAILURE` -> `NAVIGATE_FAILURE`

### Stores

Previously, keeping track of navigation and route changes was done by implementing an `ApplicationStore` or a `PageStore` yourself. We experimented with two approaches.

Our `flux-examples` repo had an `ApplicationStore`. You can see the diff when we upgraded to `fluxible-router` here: https://github.com/yahoo/flux-examples/pull/119/files

Our doc site [fluxible.io](http://fluxible.io) was using a `PageStore`, which is more similar to the `RouteStore` we have in `fluxible-router` today. You can see our diff of our upgrade to `fluxible-router` here: https://github.com/yahoo/fluxible.io/pull/120/files

In general `fluxible-router` ships a `RouteStore` you should be using instead of rolling your own.


### Rendering the right component

Previously we experimented with two approaches to choosing which component to render in our application component based on the current route.

Our `flux-examples` repo had a `switch` statement that chose the component based on the current route. You can see the diff when we upgraded to `fluxible-router` here: https://github.com/yahoo/flux-examples/pull/119/files

Our doc site [fluxible.io](http://fluxible.io) was using a `component` property on the route config, which contained the reference to the component that should be rendered for that route. This is similar to the `handler` property we recommend using with `fluxible-router` today. You can see our diff of our upgrade to `fluxible-router` here: https://github.com/yahoo/fluxible.io/pull/120/files

In general you'll see us using a `handler` property with our route config that contains the component we want to render for that route. But you could use any property name you like. There's nothing magical happening internally with regards to components, it's just another property that get's passed around with the route.

### Route config

There are a few properties for a route that are important for `fluxible-router`; `method`, `path`, `pageTitle` (optional) and `action` (optional). Any other properties you define are simply passed along with your route object.

`pageTitle` is a newer addition to a route's config which relives you from having to update `document.title` yourself.
