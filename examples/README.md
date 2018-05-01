# flux-examples

Example isomorphic [Flux][] applications using [Fluxible][], 
[fluxible-router][], and [fluxible-plugin-fetchr][].

The server-side rendered React components and store instances get dehydrated 
and sent to the client using [express-state][]. The client.js (compiled by 
[webpack][]) then bootstraps and rehydrates the dispatcher instance and the 
stores to same state as what they were on the server.

There are multiple examples in this repo:

* [Chat](chat) - Port of [Facebook's Flux chat example](https://github.com/facebook/flux/tree/master/examples/flux-chat).
* [Fluxible Routing](fluxible-router) - Simple isomorphic routing using [Fluxible][].
* [React Routing](react-router) - Isomorphic routing using [react-router](https://github.com/rackt/react-router).
* [To Do](todo) - Port of [ToDo MVC](https://github.com/tastejs/todomvc).

Alternatively, for a fully featured application you can check out the 
[fluxible.io][Fluxible] docs website repository for more integration examples:

* https://github.com/yahoo/fluxible/tree/master/site

Want more examples? Check out our [community reference applications](https://github.com/yahoo/fluxible/blob/master/docs/community/reference-applications.md).


Usage
-----

```
npm install
cd <folder>
npm run dev
```

Open http://localhost:3000

For more information on what's going on, you can use `DEBUG=* node` to see full 
debug output on the server.


# License

Unless otherwise specified, this software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
[Flux]: http://facebook.github.io/react/docs/flux-overview.html
[Fluxible]: http://fluxible.io
[fluxible-router]: https://github.com/yahoo/blob/master/packages/fluxible-router
[fluxible-plugin-fetchr]: https://github.com/yahoo/blob/master/packages/fluxible-plugin-fetchr
[express-state]: https://github.com/yahoo/express-state
[webpack]: https://github.com/webpack/webpack
