# BaseStore

```js
import BaseStore from 'fluxible/addons/BaseStore';
```

A base class that you can extend to reduce boilerplate when creating stores.

## Built-In Methods

* `emitChange()` - emits a 'change' event
* `getContext()` - returns the [store context](../FluxibleContext.md#store-context)
* `addChangeListener(callback)` - simple method to add a change listener
* `removeChangeListener(callback)` - removes a change listener
* `shouldDehydrate()` - default implementation that returns true if a `change` event has been emitted

## Example

```js
class ApplicationStore extends BaseStore {
    constructor (dispatcher) {
        super(dispatcher);
        this.currentPageName = null;
    }

    handleReceivePage (payload) {
        this.currentPageName = payload.pageName;
        this.emitChange();
    }

    getCurrentPageName () {
        return this.currentPageName;
    }

    // For sending state to the client
    dehydrate () {
        return {
            currentPageName: this.currentPageName
        };
    }

    // For rehydrating server state
    rehydrate (state) {
        this.currentPageName = state.currentPageName;
    }
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
    'RECEIVE_PAGE': 'handleReceivePage'
};

export default ApplicationStore;
```
