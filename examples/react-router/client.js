/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global App, document, window */
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var createBrowserHistory = require('history/lib/createBrowserHistory');
var debug = require('debug');
var bootstrapDebug = debug('Example');
var app = require('./app');
var dehydratedState = window.App; // Sent from the server
var ReactRouter = require('react-router');
var FluxibleComponent = require('fluxible-addons-react/FluxibleComponent');
var createElement = require('fluxible-addons-react/createElementWithContext');

bootstrapDebug('rehydrating app');

function RenderApp(context){
    bootstrapDebug('React Rendering');
    var mountNode = document.getElementById('app');
    ReactDOM.render(
        React.createElement(
            FluxibleComponent,
            { context: context.getComponentContext() },
            React.createElement(ReactRouter.Router, {
                routes: context.getComponent(),
                history: createBrowserHistory()
            })
        ),
        mountNode,
        function () {
            bootstrapDebug('React Rendered');
        }
    );
}

app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }
    window.debug = debug;
    window.context = context;

    RenderApp(context);
});
