/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global App, document, window */
'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const debug = require('debug');
const bootstrapDebug = debug('Example');
const app = require('./app').default;
const dehydratedState = window.App; // Sent from the server
const ReactRouter = require('react-router');
const { FluxibleComponent } = require('fluxible-addons-react');

bootstrapDebug('rehydrating app');

function RenderApp(context) {
    bootstrapDebug('React Rendering');
    const mountNode = document.getElementById('app');
    ReactDOM.render(
        React.createElement(
            FluxibleComponent,
            { context: context.getComponentContext() },
            React.createElement(ReactRouter.Router, {
                routes: context.getComponent(),
                history: ReactRouter.browserHistory,
            }),
        ),
        mountNode,
        function () {
            bootstrapDebug('React Rendered');
        },
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
