# Stale props example

This example shows how to handle the stale props issue. The stale
props issue happens when the following conditions are met:

1. A child component relies on its props to retrieve data from the store
2. The child component subscribes to the store before its parent.

A concrete example would be a TODO app with the follow features:

1. It populates the store in the client with data from the server
   through the rehydration (SSR).
2. The parent component would be a list that retrieves only the items
   ids from the store and renders each item by passing only their ids
   as props.
3. The child component would be each item that takes the id from the
   props and retrieves the remaining data from the store by
   subscribing to it.

In the above scenario, after deleting one item that came from the
rehydration process, the app could crash if the item component is not
handling the case where the item content doesn't exist anymore in the
store.

This examples shows a possibility on how to handle the above case.

## How to run it

```bash
npm install
npm start
```
