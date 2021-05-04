# routing with fluxible

This shows routing on the client and the server with [Fluxible](http://fluxible.io). Navigation uses history pushes on the client but browser refresh will render the current page correctly on the server.

## Usage

Make sure you run `npm install` from the root of flux-examples. Then change directory to fluxible-router (`cd fluxible-router`) and run:

```bash
$ npm run dev
```

This will use `nodemon` and `webpack` to watch for changes and restart and rebuild as needed.

Open http://localhost:3000

### Browser-only setup

It is possible to use fluxible and fluxible-router in browser-only enviroment.
To run the example in browser-only enviroment install npm modules and run following command from fluxible-router directory
```bash
$ npm run dev-browser
```
Open http://localhost:3000

Directory `fluxible-router/browser-only` contains files, required for browser-only setup.
