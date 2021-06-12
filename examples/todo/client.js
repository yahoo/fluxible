/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, window */
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var app = require('./app');
var createElement = require('fluxible-addons-react/createElementWithContext');

var dehydratedState = window.App; // sent from the server

app.rehydrate(dehydratedState, function (err, context) {

    if (err) {
        throw err;
    }

    window.context = context;

    var mountNode = document.getElementById('todoapp');

    ReactDOM.render(createElement(context), mountNode);
});
