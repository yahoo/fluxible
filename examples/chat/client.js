/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global App, document, window, location */
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var debug = require('debug');
var bootstrapDebug = debug('Example');
var app = require('./app');
var dehydratedState = window.App || {}; // Sent from the server
var RouteStore = require('./stores/RouteStore');
var navigateAction = require('fluxible-router').navigateAction;
var createElement = require('fluxible-addons-react').createElementWithContext;

bootstrapDebug('rehydrating app');
app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }

    window.debug = debug; // Allow control over debug logging
    window.context = context; // For accessing from browser console

    bootstrapDebug('React Rendering');
    var mountNode = document.getElementById('app');
    ReactDOM.render(createElement(context), mountNode, function () {
        bootstrapDebug('React Rendered');
    });

    // If server did not load data, fire off the navigateAction
    if (!context.getStore(RouteStore).getCurrentRoute()) {
        setTimeout(function () {
            context.executeAction(navigateAction, { url: window.location.pathname + window.location.search, type: 'pageload' }, function (err) {
                throw err;
            });
        }, 1000);
    }
});
