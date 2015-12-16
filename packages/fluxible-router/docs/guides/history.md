# History Management

Considering different application needs and [different browser support levels for pushState](http://caniuse.com/#search=pushstate), this library provides the following options for browser history management:

* Use `History` provided by this library (Default)
* Use `HistoryWithHash` provided by this library
* In addition, you can also customize it to use your own

## History

This is the default `History` implementation `RouterMixin` uses.  It is a straight-forward implementation that:
* uses `pushState`/`replaceState` when they are available in the browser.
* For the browsers without pushState support, `History` simply refreshes the page by setting `window.location.href = url` for `pushState`, and calling `window.location.replace(url)` for `replaceState`.



## Provide Your Own History Manager

If none of the history managers provided in this library works for your application, you can also customize the `handleHistory` higher order component to use your own history manager implementation.  Please follow the same API as `History`.

### API

Please use `History.js` and `HistoryWithHash.js` as examples.

* on(listener)
* off(listener)
* getUrl()
* getState()
* pushState(state, title, url)
* replaceState(state, title, url)

### Example:

```js
Application = handleHistory(Application, {
    historyCreator: function historyCreator() {
        return new MyHistory();
    }
});
```
