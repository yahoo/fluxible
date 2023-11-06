/**
 * This leverages Express to create and run the http server.
 * A Fluxible context is created and executes the navigateAction
 * based on the URL. Once completed, the store state is dehydrated
 * and the application is rendered via React.
 */

import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import path from 'path';
import serialize from 'serialize-javascript';
import { navigateAction } from 'fluxible-router';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import app from './app';
import HtmlComponent from './components/Html';
import { createElementWithContext } from 'fluxible-addons-react';
const env = process.env.NODE_ENV;

const server = express();
server.use('/public', express.static(path.join(__dirname, 'public')));
server.use(compression());
server.use(bodyParser.json());

server.use((req, res, next) => {
    const context = app.createContext();

    context.getActionContext().executeAction(
        navigateAction,
        {
            url: req.url,
        },
        (err) => {
            if (err) {
                if (err.statusCode && err.statusCode === 404) {
                    // Pass through to next middleware
                    next();
                } else {
                    next(err);
                }
                return;
            }

            const exposed =
                'window.App=' + serialize(app.dehydrate(context)) + ';';

            const markup = ReactDOMServer.renderToString(
                createElementWithContext(context),
            );
            const htmlElement = React.createElement(HtmlComponent, {
                clientFile: env === 'production' ? 'main.min.js' : 'main.js',
                context: context.getComponentContext(),
                state: exposed,
                markup: markup,
            });
            const html = ReactDOMServer.renderToStaticMarkup(htmlElement);

            res.type('html');
            res.write('<!DOCTYPE html>' + html);
            res.end();
        },
    );
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log('Application listening on port ' + port);

export default server;
