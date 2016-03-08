# Fluxible Router

[![NPM version](https://badge.fury.io/js/fluxible-router.svg)](http://badge.fury.io/js/fluxible-router)

Isomorphic Flux routing for applications built with [Fluxible](https://github.com/yahoo/fluxible).

```bash
$ npm install --save fluxible-router
```

## Docs

 * [Quick Start](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/docs/quick-start.md)
 * [API](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/docs/api/README.md)
 * [Upgrade Guide](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/UPGRADE.md)

## Features

 * Isomorphic routing
 * Follows Flux flow
 * Higher order components for handling [history](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/docs/api/handleHistory.md) and [routes](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/docs/api/handleRoute.md)
 * [`navigateAction`](https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/docs/api/navigateAction.md) for changing routes
 * Updated for React 0.15

## Required Polyfills

`addEventListener` and `removeEventListener` polyfills are provided by:

* Compatibility code example on [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
* A few DOM polyfill libaries listed on [Modernizer Polyfill wiki page](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#dom).

`Array.prototype.reduce` and `Array.prototype.map` (used by dependent library, query-string) polyfill examples are provided by:

* [Mozilla Developer Network Array.prototype.reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
* [Mozilla Developer Network Array.prototype.map polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill)

`Object.assign`

 * [object.assign](https://www.npmjs.com/package/object.assign) or [es6-shim](https://github.com/paulmillr/es6-shim)

You can also look into this [polyfill.io polyfill service](https://cdn.polyfill.io/v1/).

## Compatible React Versions

| Compatible React Version | fluxible-router Version |
|--------------------------|-------------------------------|
| 15.0 | >= 0.4.10 |
| 0.14 | >= 0.3.x |
| 0.13 | <= 0.2.x |

## License
This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md

Third-party open source code used are listed in our [package.json file]( https://github.com/yahoo/fluxible/blob/master/packages/fluxible-router/package.json).
