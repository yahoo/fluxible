# fluxible.io

The original doc site for [Fluxible](https://github.com/yahoo/fluxible).

## Setup

```bash
npm install
```

There is also a `/secrets.example.js` file that you need to copy to `/secrets.js` with your GitHub API credentials to allow the app to access the page content it needs from GitHub.

## Run the app

```bash
npm run dev
```

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed.

Open [http://localhost:3000](http://localhost:3000)

### Production

To run in production, use `NODE_ENV=production npm run dev`. This will use the production
assets that `webpack` generates. NOTE, this may break your application if the asset hashes
are not on CDN.

## How its built

The documentation for the site is generated from the [yahoo/fluxible](https://github.com/yahoo/fluxible) repository. On server start, the [docs service](https://github.com/yahoo/fluxible/blob/master/site/services/docs.js), reads the [route configuration](https://github.com/yahoo/fluxible/blob/master/site/configs/routes.js) and leverages the Github API to access the associated markdown document. Each document is parsed and cached. To account for any document updates, we refresh the cache every hour.

### Styles

Fluxible leverages [Atomic CSS](http://acss.io/) to include the minimal set of CSS to style the site. The [grunt-atomizer](https://www.npmjs.com/package/grunt-atomizer) library scans the React components for Atomic CSS classes and builds a CSS file of only the CSS classes that we specify. This keeps the CSS size to an absolute minimum.

### Search

Fluxible.io leverages the [lunr.js](http://lunrjs.com/) full-text search library to provide client side search functionality.

### Creating the index

On server start, the [docs service](https://github.com/yahoo/fluxible/blob/master/site/services/docs.js) creates a lunr.js index and adds each markdown document to it. The index is then serialized and saved to the `/build/search.json` file, so it can be leveraged on the client. The index is about ~1mb in size and too large to dehydrate from the server.

### Loading the index

On the client, the [Search](https://github.com/yahoo/fluxible/blob/master/site/components/Search.jsx) component has a `componentDidMount` lifecycle event which executes the [loadIndex](https://github.com/yahoo/fluxible/blob/master/site/actions/loadIndex.js) action. This action will call the [Search service](https://github.com/yahoo/fluxible/blob/master/site/services/search.js) to read the `/build/search.json` index file and return that to the action. The `RECEIVE_INDEX` action is then fired with this payload, which the `SearchStore` listens to and saves the index in the store.

### Performing a search

The [Search](https://github.com/yahoo/fluxible/blob/master/site/components/Search.jsx) component contains an input field that is displayed when the search icon is clicked. After the search query is entered and `ENTER` is pressed, the `navigateAction` event is fired to load the new `/search.html` page (we use the `navigateAction` to save the query in the browser history).

The `/search.html` route uses the [showSearch](https://github.com/yahoo/fluxible/blob/master/site/actions/showSearch.js) action to dispatch the `DO_SEARCH` event with the search query in the payload. The [SearchStore](https://github.com/yahoo/fluxible/blob/master/site/stores/SearchStore.js) uses the query to perform a search on the search index. State is stored and `emitChange` is called. The `Docs` component listens to change events from the [SearchStore](https://github.com/yahoo/fluxible/blob/master/site/stores/SearchStore.js) and renders the [SearchResults](https://github.com/yahoo/fluxible/blob/master/site/components/SearchResults.jsx) component with the search results.

Lastly, to enable search result deep linking, we use the `componentDidUpdate` lifecycle event of the [SearchResults](https://github.com/yahoo/fluxible/blob/master/site/components/SearchResults.jsx) component to execute the [doSearch](https://github.com/yahoo/fluxible/blob/master/site/actions/doSearch.js) action and display the search results.

## Testing

Unit tests can be run via `npm test`.

To run functional tests, ensure you have `webdriver` updated:

```bash
./node_modules/.bin/webdriver-manager update --standalone
```

Then run `npm run func` to run protractor to execute the functional tests.

## Publishing

The site is hosted on Heroku and requires simple setup to push to the staging server. Check out the gist:

https://gist.github.com/redonkulus/a29fe3c85c3e5b4c2c78eb4c1ef61ef4

## License

Unless otherwise specified, this software is free to use under the Yahoo! Inc.
BSD license. See the [LICENSE file][] for license text and copyright
information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
