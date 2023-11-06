/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import '@babel/register';
import express from 'express';
import serialize from 'serialize-javascript';
import { navigateAction } from 'fluxible-router';
import debugLib from 'debug';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { createElementWithContext } from 'fluxible-addons-react';
import app from './app';
import HtmlComponent from './components/Html';

const debug = debugLib('Example');
const server = express();

server.use('/public', express.static(__dirname + '/build'));
server.use((req, res, next) => {
    const context = app.createContext();

    debug('Executing navigate action');
    context.executeAction(navigateAction, { url: req.url }, (err) => {
        if (err) {
            if (err.statusCode && err.statusCode === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }

        debug('Exposing context state');
        const state = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        const markup = ReactDOM.renderToString(
            createElementWithContext(context),
        );
        const helmet = Helmet.renderStatic();

        debug('Rendering Application component into html');
        const html = ReactDOM.renderToStaticMarkup(
            React.createElement(HtmlComponent, {
                state,
                markup,
                helmet,
                context: context.getComponentContext(),
            }),
        );

        debug('Sending markup');
        res.send(html);
    });
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
