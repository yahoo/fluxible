/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, window */
'use strict';
const ReactDOM = require('react-dom');
const app = require('./app');
const { createElementWithContext } = require('fluxible-addons-react');

const dehydratedState = window.App; // sent from the server

app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }

    window.context = context;

    const mountNode = document.getElementById('todoapp');

    ReactDOM.hydrate(createElementWithContext(context), mountNode);
});
