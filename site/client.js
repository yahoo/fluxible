/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, window */

import React from 'react';
import { render } from 'react-dom';
import app from './app';
import Debug from 'debug';
import {
    batchedUpdatePlugin,
    createElementWithContext,
} from 'fluxible-addons-react';

// Add batched update plugin on client only
app.plug(batchedUpdatePlugin());

const dehydratedState = window.App; // sent from the server

window.app = app;
window.fluxibleDebug = Debug;

app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }

    window.context = context;

    render(
        createElementWithContext(context),
        document.getElementById('docsapp'),
    );
});
