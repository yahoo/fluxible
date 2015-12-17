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
yo fluxible
```

During development, execute `npm run dev` to initiate webpack-dev-server 
(with react-hot-loader support) and your application's server using nodemon. 
Browse to `http://localhost:3000` to see a very simple Fluxible site with 
server-side rendering and client-side navigation. When you change files,
the client will be hot-reloaded (with the exception of stores) and your
application server will restart so that you can see the server-side changes
on the next refresh.

For other environments, make sure your application is built using 
`npm run build` and then run `npm start`.

## Debugging

Fluxible uses [debug](https://www.npmjs.com/package/debug) to expose debugging 
information on the server and client. 

### Server

Start the application with the `DEBUG` environment variable: `DEBUG=* grunt`.

### Client

`fluxibleDebug` is exposed to the `window` object to manage debugging. You can 
enable it via the browser console: `fluxibleDebug.enable('*');` then refresh 
the page. To disable, type the following: `fluxibleDebug.disable();`.
