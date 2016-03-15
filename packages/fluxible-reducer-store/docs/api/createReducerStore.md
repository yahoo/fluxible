# createReducerStore

```js
import {createReducerStore} from 'fluxible-reducer-store';
```

A helper method for creating reducer stores for Fluxible. 

## Usage

```js
const CountStore = createReducerStore(spec);
```

The spec can contain the following keys:

### `storeName`

As with all stores in Fluxible, you will need an identifier for your store.

### `reducers` or `reducer`

This should be a map of `eventName`s that are dispatched through the dispatcher
to the reducer that should handle that event. Reducers should be stateless and 
immutable.

```js
{
    ...spec,
    reducers: {
        INCREMENT_COUNTER: (state, payload) => {
            return {
                ...state,
                count: state.count + 1
            };
        }
    }
}
```

If you prefer to have a single reducer function for all events, you can pass
a single `reducer`:

```js
{
    ...spec,
    reducer: (state, payload, eventName) => {
        if ('INCREMENT_COUNTER' === eventName) {
            return {
                ...state,
                count: state.count + 1
            };
        }
        return state;
    }
}
```

### `initialState`

To set up the initial state of your store you can pass an object that will
set the state at instantiation time:

```js
{
    ...spec,
    initialState: {
        count: 0
    }
}
```

### `getters`

You can optionally pass a set of getter functions on your store. Getters are 
implemented as reducers themselves: they take in state and return the "view" 
of that state.

```js
{
    ...spec,
    getters: {
        getCount: (state) => {
            return state.count;
        }
    }
}
```

You can still call them like you would a getter on a store though:

```js
context.getStore(CountStore).getCount();
```

This is a convenient way of sharing "views" of your data between several 
components.

## Full Example

```js
const MessageStore = createReducerStore({
    storeName: 'MessageStore',
    initialState: {
        messages: {},
        sortedByDate: []
    },
    reducers: {
          RECEIVE_MESSAGES: (state, messages) => {
              var oldMessages = state.messages;
              var newMessages = {...oldMessages};
              messages.forEach(function (message) {
                  newMessages[message.id] = {
                      ...message,
                      isRead: false
                  };
              });
              var sortedByDate = (newMessages && Object.keys(newMessages)) || [];
              sortedByDate.sort(function (a, b) {
                  if (newMessages[a].date < newMessages[b].date) {
                      return -1;
                  } else if (newMessages[a].date > newMessages[b].date) {
                      return 1;
                  }
                  return 0;
              });
      
              return {
                  messages: newMessages,
                  sortedByDate
              };
          },
          OPEN_THREAD: (state, payload) => {
              // Mark all read
              var oldMessages = state.messages;
              var newMessages = {
                  ...oldMessages
              };
              Object.keys(state.messages).forEach((key) => {
                  var message = state.messages[key];
                  if (message.threadID === payload.threadID) {
                      newMessages[key] = {
                          ...message,
                          text: message.text + 'foo',
                          isRead: true
                      };
                  }
              });
              return {
                  ...state,
                  messages: newMessages
              };
          }
      },
    getters: {
        getAll: function getAll(state) {
            return state.messages;
        },
        get: function get(state, id) {
            return state.messages[id];
        },
        getAllForThread: function getAllForThread(state, threadID) {
            var threadMessages = [];
            state.sortedByDate.forEach(function (key) {
                var message = state.messages[key];
                if (message.threadID === threadID) {
                    threadMessages.push(message);
                }
            });
            return threadMessages;
        }
    }
});

export default MessageStore;
```

Now the store can be registered as a normal store.

## Hot Reloading

If you are using webpack's hot module replacement, it is easy to make your 
reducer stores hot reloadable. We recommend separating the spec and the call
to `createReducerStore`. For example you could have only the spec in your
store file and call `createReducerStore` in your `app.js`.

Once you have separated the spec and the store construction, you need to add
the `module.hot.accept` call, require the new spec, and call `Store.replaceSpec`
to ensure that the reducer and getter definitions are correctly replaced.

_Note: any file that requires your store spec 
(e.g. `./stores/MessageStore`) will have to implement `module.hot.accept`
including components or actions. You can either implement it in all of your
files or remove the `require`s and call `getStore` with the `storeName` string
instead of the spec/constructor: `context.getStore('MessageStore')`._

### Example

```js
// ./stores/MessageStore.js
export default {
    storeName: 'MessageStore',
    reducers: { ...},
    initialState: {}
};
```

```js
// ./app.js

const app = new Fluxible();
const MessageStore = createReducerStore(require('./stores/MessageStore'));

app.registerStore(MessageStore);

if (module.hot) {
    module.hot.accept('./stores/MessageStore', function () {
        var NewMessageStore = require('./stores/MessageStore');
        MessageStore.replaceSpec(NewMessageStore);
    });
}
```
