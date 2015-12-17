/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global App, document, window */
import React from 'react';
import {render} from 'react-dom';
import debug from 'debug';
import app from './app';
import { createElementWithContext } from 'fluxible-addons-react';

const bootstrapDebug = debug('Example');
const dehydratedState = window.App; // Sent from the server

bootstrapDebug('rehydrating app');
app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }
    window.debug = debug;
    window.context = context;
    const mountNode = document.getElementById('app');

    bootstrapDebug('React Rendering');
    render(createElementWithContext(context), mountNode, () => {
        bootstrapDebug('React Rendered');
    });
});
