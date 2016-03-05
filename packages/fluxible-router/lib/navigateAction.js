/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var debug = require('debug')('navigateAction');

function navigateAction (context, payload, done) {
    var routeStore = context.getStore('RouteStore');

    var navigate = Object.assign({
        transactionId: context.rootId
    }, payload);
    if (!payload.url && payload.routeName) {
        navigate.url = routeStore.makePath(payload.routeName, payload.params);
        navigate.routeName = null;
    }

    debug('dispatching NAVIGATE_START', navigate);
    context.dispatch('NAVIGATE_START', navigate);

    if (!routeStore.getCurrentRoute) {
        done(new Error('RouteStore has not implemented `getCurrentRoute` method.'));
        return;
    }

    var route = routeStore.getCurrentRoute();

    if (!route) {
        var error404 = {
            transactionId: navigate.transactionId,
            statusCode: 404,
            message: 'Url \'' + payload.url + '\' does not match any routes'
        };

        context.dispatch('NAVIGATE_FAILURE', error404);
        done(Object.assign(new Error(), error404));
        return;
    }

    var action = route.action;
    if ('string' === typeof action && context.getAction) {
        action = context.getAction(action);
    }

    if (!action || 'function' !== typeof action) {
        debug('route has no action, dispatching without calling action');
        context.dispatch('NAVIGATE_SUCCESS', route);
        done();
        return;
    }

    debug('executing route action');
    context.executeAction(action, route, function (err) {
        if (err) {
            var error500 = {
                transactionId: navigate.transactionId,
                statusCode: err.statusCode || 500,
                message: err.message
            };

            context.dispatch('NAVIGATE_FAILURE', error500);
            done(Object.assign(err, error500));
        } else {
            context.dispatch('NAVIGATE_SUCCESS', route);
            done();
        }
    });
}

navigateAction.displayName = 'navigateAction';

module.exports = navigateAction;
