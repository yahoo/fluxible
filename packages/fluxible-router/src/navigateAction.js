/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
function navigateAction(context, payload, done) {
    var routeStore = context.getStore('RouteStore');

    var navigate = Object.assign(
        {
            transactionId: context.rootId,
        },
        payload,
    );
    if (!payload.url && payload.routeName) {
        navigate.url = routeStore.makePath(
            payload.routeName,
            payload.params,
            payload.query,
        );
        navigate.routeName = null;
    }

    context.dispatch('NAVIGATE_START', navigate);

    if (!routeStore.getCurrentRoute) {
        done(
            new Error(
                'RouteStore has not implemented `getCurrentRoute` method.',
            ),
        );
        return;
    }

    var route = routeStore.getCurrentRoute();
    var completionPayload = Object.assign({}, navigate, {
        err: null,
        route: route,
    });

    if (!route) {
        completionPayload.error = {
            statusCode: 404,
            message: "Url '" + payload.url + "' does not match any routes",
        };

        context.dispatch('NAVIGATE_FAILURE', completionPayload);
        done(Object.assign(new Error(), completionPayload.error));
        return;
    }

    var action = route.action;
    if (!action) {
        context.dispatch('NAVIGATE_SUCCESS', completionPayload);
        done();
        return;
    }

    if ('string' === typeof action && context.getAction) {
        action = context.getAction(action);
    }

    if (!action || 'function' !== typeof action) {
        completionPayload.error = {
            statusCode: 500,
            message: 'Action for ' + payload.url + ' can not be resolved',
        };
        context.dispatch('NAVIGATE_FAILURE', completionPayload);
        done(completionPayload.error);
        return;
    }

    context.executeAction(action, route, function (err) {
        if (err) {
            completionPayload.error = {
                statusCode: err.statusCode || 500,
                message: err.message,
            };

            context.dispatch('NAVIGATE_FAILURE', completionPayload);
            done(Object.assign(err, completionPayload.error));
        } else {
            context.dispatch('NAVIGATE_SUCCESS', completionPayload);
            done();
        }
    });
}

navigateAction.displayName = 'navigateAction';

export default navigateAction;
