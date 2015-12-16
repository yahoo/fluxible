# HistoryWithHash

Using hash-based url for client side routing has a lot of known issues.  [History.js describes those issues pretty well](https://github.com/browserstate/history.js/wiki/Intelligent-State-Handling).

But as always, there will be some applications out there that have to use it.  This implementation provides a solution.

If you do decide to use hash route, it is recommended to enable `checkRouteOnPageLoad`.  Because hash fragment (that contains route) does not get sent to the server side, [`handleHistory`](../handleHistory.md) will compare the route info from server and route in the hash fragment.  On route mismatch, it will dispatch a navigate action on browser side to load the actual page content for the route represented by the hash fragment.

## `useHashRoute` Config

You can decide when to use hash-based routing through the `useHashRoute` option:

* `useHashRoute=true` to force to use hash routing for all browsers, by setting `useHashRoute` to `true` when creating the `HistoryWithHash` instance.
* `unspecified` i.e. omitting the setting, to only use hash route for browsers without native pushState support.
* `useHashRoute=false` to turn off hash routing for all browsers.

|  | useHashRoute = true | useHashRoute = false | useHashRoute unspecified |
|--|---------------------|----------------------|--------------------------|
| Browsers *with* pushState support | history.pushState with /home#/path/to/pageB | history.pushState with /path/to/pageB | Same as `useHashRoute = false` |
| Browsers *without* pushState support | page refresh to /home#/path/to/pageB | page refresh to /path/to/pageB | Same as `useHashRoute = true` |

## Custom Transformer for Hash Fragment

By default, the hash fragments are just url paths.  With `HistoryWithHash`, you can transform it to whatever syntax you need by passing `options.hashRouteTransformer` to the constructor.  See the example below for how to configure it.

## Example

```js
var handleHistory = require('fluxible-router').handleHistory;
var HistoryWithHash = require('fluxible-router/addons').HistoryWithHash;

var AppComponent = React.createClass({
    // ...
});

// wrap with history handler
AppComponent = handleHistory(Application, {
    historyCreator: function historyCreator() {
        return new HistoryWithHash({
            // optional. Defaults to true if browser does not support pushState; false otherwise.
            useHashRoute: true,
            // optional. Defaults to '/'. Used when url has no hash fragment
            defaultHashRoute: '/default',
            // optional. Transformer for custom hash route syntax
            hashRouteTransformer: {
                transform: function (original) {
                    // transform url hash fragment from '/new/path' to 'new-path'
                    var transformed = original.replace('/', '-').replace(/^(\-+)/, '');
                    return transformed;
                },
                reverse: function (transformed) {
                    // reverse transform from 'new-path' to '/new/path'
                    var original = '/' + (transformed && transformed.replace('-', '/'));
                    return original;
                }
            }
        });
    }
});

module.exports = AppComponent;
```
