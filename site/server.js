/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import serialize from 'serialize-javascript';
import { navigateAction } from 'fluxible-router';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import app from './app';
import HtmlComponent from './components/Html';
import assets from './utils/assets';
import DocsService from './services/docs';
import SearchService from './services/search';
import { createElementWithContext } from 'fluxible-addons-react';
import redirects from './configs/redirects';

const htmlComponent = React.createFactory(HtmlComponent);
const server = express();

server.use(
    require('limits')({
        enable: true,
        file_uploads: true,
        global_timeout: 5000,
        inc_req_timeout: 5000,
        out_req_timeout: 5000,
        post_max_size: 2000000,
    }),
);

server.set('state namespace', 'App');
server.use(favicon(path.join(__dirname, '/assets/images/favicon.ico')));
server.use('/status.html', (req, res) => res.sendStatus(200));
server.use(
    '/public',
    express.static(path.join(__dirname, '/build'), {
        maxAge: '1y',
    }),
);
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({ cookie: true }));

// Disable proxies from caching the page (static css/js assets are still cached)
server.set('etag', false);
server.use((req, res, next) => {
    res.set('Cache-Control', 'private, no-store, max-age=0');
    next();
});

// Get access to the fetchr plugin instance
const fetchrPlugin = app.getPlugin('FetchrPlugin');

// Register our services
fetchrPlugin.registerService(DocsService);
fetchrPlugin.registerService(SearchService);

// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Set up redirects for old urls
Object.keys(redirects).forEach((from) => {
    let to = redirects[from];
    server.use(from, (req, res) => {
        res.redirect(301, to);
    });
});

// Render the app
function renderApp(res, context) {
    const appElement = createElementWithContext(context);
    const renderedApp = renderToString(appElement);
    const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';
    const doctype = '<!DOCTYPE html>';
    const componentContext = context.getComponentContext();
    const html = renderToStaticMarkup(
        htmlComponent({
            assets: assets,
            context: componentContext,
            state: exposed,
            markup: renderedApp,
        }),
    );

    res.send(doctype + html);
}

// Every other request gets the app bootstrap
server.use(function (req, res, next) {
    const context = app.createContext({
        req: req, // The fetchr plugin depends on this
        debug: req.query.debug,
        xhrContext: {
            _csrf: req.csrfToken(), // Make sure all XHR requests have the CSRF token
        },
    });

    context.executeAction(navigateAction, { url: req.url }, function (err) {
        if (err) {
            if (err.statusCode === 404) {
                return next();
            }
            return next(err);
        }
        renderApp(res, context);
    });
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
