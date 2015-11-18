# createStore

```js
import createStore from 'fluxible/addons/createStore';
```

A helper method similar to `React.createClass` but for creating stores that extend [`BaseStore`](BaseStore.md). Also supports mixins.

## Example

```js
export default createStore({
    storeName: 'ApplicationStore',
    handlers: {
        'RECEIVE_PAGE': 'handleReceivePage'
    },
    handleReceivePage: function (payload) {
        this.currentPageName = payload.pageName;
        this.emitChange();
    },
    getCurrentPage: function () {
        return this.currentPageName;
    },
    dehydrate: function () {
        return {
            currentPageName: this.currentPageName
        };
    },
    rehydrate: function (state) {
        this.currentPageName = state.currentPageName;
    }
});
```
