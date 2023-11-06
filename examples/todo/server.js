/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
require('@babel/register');
const express = require('express');
const serialize = require('serialize-javascript');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const React = require('react');
const ReactDOM = require('react-dom/server');
const app = require('./app');
const showTodos = require('./actions/showTodos');
const HtmlComponent = React.createFactory(require('./components/Html'));
const { createElementWithContext } = require('fluxible-addons-react');

const server = express();
server.set('state namespace', 'App');
server.use('/public', express.static(__dirname + '/build'));
server.use('/assets', express.static(__dirname + '/assets'));
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({ cookie: true }));

// Get access to the fetchr plugin instance
const fetchrPlugin = app.getPlugin('FetchrPlugin');

// Register our todos REST service
fetchrPlugin.registerService(require('./services/todo'));

// Set up the fetchr middleware
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Every other request gets the app bootstrap
server.use(function (req, res, next) {
    const context = app.createContext({
        req: req, // The fetchr plugin depends on this
        xhrContext: {
            _csrf: req.csrfToken(), // Make sure all XHR requests have the CSRF token
        },
    });

    context.executeAction(showTodos, {}, function (err) {
        if (err) {
            if (err.statusCode && err.statusCode === 404) {
                return next();
            } else {
                return next(err);
            }
        }

        const exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        const componentContext = context.getComponentContext();
        const html = ReactDOM.renderToStaticMarkup(
            HtmlComponent({
                state: exposed,
                markup: ReactDOM.renderToString(
                    createElementWithContext(context),
                ),
                context: componentContext,
            }),
        );

        res.send(html);
    });
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
