/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global App, document, window */
'use strict';
var React = require('react');
var debug = require('debug');
var bootstrapDebug = debug('Example');
var app = require('./app');
var dehydratedState = window.App; // Sent from the server
var Router = require('react-router');
var HistoryLocation = Router.HistoryLocation;
var navigateAction = require('./actions/navigate');
var FluxibleComponent = require('fluxible-addons-react/FluxibleComponent');
var createElement = require('fluxible-addons-react/createElementWithContext');

bootstrapDebug('rehydrating app');

function RenderApp(context, Handler){
    bootstrapDebug('React Rendering');
    var mountNode = document.getElementById('app');
    var Component = React.createFactory(Handler);
    React.render(
        React.createElement(
            FluxibleComponent,
            { context: context.getComponentContext() },
            Component()
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

    var firstRender = true;
    Router.run(app.getComponent(), HistoryLocation, function (Handler, state) {
        if (firstRender) {
            // Don't call the action on the first render on top of the server rehydration
            // Otherwise there is a race condition where the action gets executed before
            // render has been called, which can cause the checksum to fail.
            RenderApp(context, Handler);
            firstRender = false;
        } else {
            context.executeAction(navigateAction, state, function () {
                RenderApp(context, Handler);
            });
        }
    });
});
