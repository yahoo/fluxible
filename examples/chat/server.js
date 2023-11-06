/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var express = require('express');
var serialize = require('serialize-javascript');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var debug = require('debug')('Example');
var React = require('react');
var ReactDOM = require('react-dom/server');
var app = require('./app');
var HtmlComponent = require('./components/Html');
var navigateAction = require('fluxible-router').navigateAction;
var createElement = require('fluxible-addons-react').createElementWithContext;

var server = express();
server.set('state namespace', 'App');
server.use('/public', express.static(__dirname + '/build'));
server.use('/assets', express.static(__dirname + '/assets'));
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({ cookie: true }));

// Get access to the fetchr plugin instance
var fetchrPlugin = app.getPlugin('FetchrPlugin');
// Register our messages REST service
fetchrPlugin.registerService(require('./services/message'));
// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

function renderPage(req, res, context) {
    debug('Exposing context state');
    var exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

    var mainMarkup;
    if ('0' === req.query.render) {
        mainMarkup = '';
    } else {
        mainMarkup = ReactDOM.renderToString(createElement(context));
    }

    debug('Rendering Application component into html');
    var html = ReactDOM.renderToStaticMarkup(
        React.createElement(HtmlComponent, {
            state: exposed,
            markup: mainMarkup,
        }),
    );

    debug('Sending markup');
    res.send(html);
}

server.use(function (req, res, next) {
    var context = app.createContext({
        req: req, // The fetchr plugin depends on this
        xhrContext: {
            _csrf: req.csrfToken(), // Make sure all XHR requests have the CSRF token
        },
    });

    debug('Executing showChat action');
    if ('0' === req.query.load) {
        renderPage(req, res, context);
    } else {
        context.executeAction(
            navigateAction,
            { url: req.url, type: 'pageload' },
            function (err) {
                if (err) {
                    if (err.statusCode && err.statusCode === 404) {
                        next();
                    } else {
                        next(err);
                    }
                    return;
                }
                renderPage(req, res, context);
            },
        );
    }
});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
