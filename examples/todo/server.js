/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
require('babel-register');
var express = require('express');
var favicon = require('serve-favicon');
var serialize = require('serialize-javascript');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var React = require('react');
var ReactDOM = require('react-dom/server');
var app = require('./app');
var showTodos = require('./actions/showTodos');
var HtmlComponent = React.createFactory(require('./components/Html'));
var createElement = require('fluxible-addons-react/createElementWithContext');


var server = express();
server.set('state namespace', 'App');
server.use('/public', express['static'](__dirname + '/build'));
server.use('/assets', express['static'](__dirname + '/assets'));
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({cookie: true}));


// Get access to the fetchr plugin instance
var fetchrPlugin = app.getPlugin('FetchrPlugin');

// Register our todos REST service
fetchrPlugin.registerService(require('./services/todo'));

// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Every other request gets the app bootstrap
server.use(function (req, res, next) {
    var context = app.createContext({
        req: req, // The fetchr plugin depends on this
        xhrContext: {
            _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
        }
    });

    context.executeAction(showTodos, {}, function (err) {
        if (err) {
            if (err.statusCode && err.statusCode === 404) {
                return next();
            }
            else {
                return next(err);
            }
        }

        var exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        var componentContext = context.getComponentContext();
        var html = ReactDOM.renderToStaticMarkup(HtmlComponent({
            state: exposed,
            markup: ReactDOM.renderToString(createElement(context)),
            context: componentContext
        }));

        res.send(html);
    });
});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
