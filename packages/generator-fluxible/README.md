# generator-fluxible

[![npm version](https://badge.fury.io/js/generator-fluxible.svg)](http://badge.fury.io/js/generator-fluxible)

## Getting Started

```bash
npm install -g yo
```

To install generator-fluxible from npm, run:

```bash
npm install -g generator-fluxible
```

Finally, initiate the generator:

```bash
cd new-project
yo fluxible
```

During development, execute `npm run dev` to initiate webpack-dev-server
(with react-hot-loader support) and your application's server using nodemon.
Browse to `http://localhost:3000` to see a very simple Fluxible site with
server-side rendering and client-side navigation. When you change files,
the server will be reloaded and the bundle will be rebuilt.

For other environments, make sure your application is built using
`npm run build` and then run `npm start`.
