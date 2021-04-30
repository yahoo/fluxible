/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
require('babel-register');

import express from 'express';
import favicon from 'serve-favicon';
import serialize from 'serialize-javascript';
import {navigateAction} from 'fluxible-router';
import debugLib from 'debug';
import React from 'react';
import ReactDOM from 'react-dom/server';
import app from './app';
import HtmlComponent from './components/Html';
import {createElementWithContext} from 'fluxible-addons-react';

const debug = debugLib('Example');
const server = express();

server.use('/public', express['static'](__dirname + '/build'));
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
        const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        debug('Rendering Application component into html');
        const html = ReactDOM.renderToStaticMarkup(React.createElement(HtmlComponent, {
            state: exposed,
            markup: ReactDOM.renderToString(createElementWithContext(context)),
            context: context.getComponentContext()
        }));

        debug('Sending markup');
        res.send(html);
    });
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
