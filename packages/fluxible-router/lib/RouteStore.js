/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons/createStore');
var Router = require('routr');
var inherits = require('inherits');

var RouteStore = createStore({
    storeName: 'RouteStore',
    handlers: {
        'NAVIGATE_START': '_handleNavigateStart',
        'NAVIGATE_SUCCESS': '_handleNavigateSuccess',
        'NAVIGATE_FAILURE': '_handleNavigateFailure',
        'RECEIVE_ROUTES': '_handleReceiveRoutes'
    },
    initialize: function () {
        this._routes = null;
        this._router = null;
        this._currentNavigate = null;
    },
    _handleNavigateStart: function (navigate) {
        var currentRoute = this._currentNavigate && this._currentNavigate.route;
        var matchedRoute = this._matchRoute(navigate.url, {
            navigate: navigate,
            method: navigate.method
        });

        // Check for equality and only update the route if it has changed
        if (this._areEqual(matchedRoute, currentRoute)) {
            matchedRoute = currentRoute;
        }

        this._currentNavigate = Object.assign({}, navigate, {
            route: matchedRoute,
            error: null,
            isComplete: false
        });

        this.emitChange();
    },
    _handleNavigateSuccess: function (navigate) {
        var curNav = this._currentNavigate;

        // Ignore successes from past navigations that have been superseded
        if (!curNav || curNav.isComplete) {
            return;
        }
        if (curNav.transactionId != navigate.transactionId) {
            return;
        }

        this._currentNavigate = Object.assign({}, curNav, {
            isComplete: true
        });
        this.emitChange();
    },
    _handleNavigateFailure: function (navigate) {
        var curNav = this._currentNavigate;

        // Ignore successes from past navigations that have been superseded
        if (!curNav || curNav.isComplete) {
            return;
        }
        if (curNav.transactionId != navigate.transactionId) {
            return;
        }

        this._currentNavigate = Object.assign({}, curNav, {
            isComplete: true,
            error: navigate.error
        });
        this.emitChange();
    },
    _handleReceiveRoutes: function (payload) {
        this._routes = Object.assign({}, this._routes || {}, payload);
        // Reset the router so that it is recreated next time it's needed
        this._router = null;
        this.emitChange();
    },
    _matchRoute: function (url, options) {
        var self = this;
        var indexOfHash = url.indexOf('#');
        var hashlessUrl = url;
        if (-1 !== indexOfHash) {
            hashlessUrl = url.substr(0, indexOfHash);
        }
        var route = self.getRouter().getRoute(hashlessUrl, options);
        if (!route) {
            return null;
        }

        var newRoute = Object.assign({}, route.config, {
            name: route.name,
            url: route.url,
            params: route.params,
            query: route.query
        });

        return newRoute;
    },
    _areEqual: function (route1, route2) {
        var url1 = route1 && route1.url;
        var url2 = route2 && route2.url;

        return url1 === url2;
    },
    makePath: function (routeName, params, query) {
        return this.getRouter().makePath(routeName, params, query);
    },
    getCurrentRoute: function () {
        return this._currentNavigate && this._currentNavigate.route;
    },
    getCurrentNavigate: function () {
        return this._currentNavigate;
    },
    getCurrentNavigateError: function () {
        return this._currentNavigate && this._currentNavigate.error;
    },
    isNavigateComplete: function () {
        return this._currentNavigate && this._currentNavigate.isComplete;
    },
    getRoute: function (url, options) {
        return this._matchRoute(url, options);
    },
    getRoutes: function () {
        return this._routes;
    },
    getRouter: function () {
        if (!this._router) {
            this._router = new Router(this.getRoutes());
        }
        return this._router;
    },
    isActive: function (href) {
        return this._currentNavigate && this._currentNavigate.url === href;
    },
    dehydrate: function () {
        return {
            currentNavigate: this._currentNavigate,
            routes: this._routes
        };
    },
    rehydrate: function (state) {
        this._routes = state.routes;
        if (this._routes) {
            this._router = null;
        }
        this._currentNavigate = state.currentNavigate;
        this._currentNavigate.route = this._matchRoute(this._currentNavigate.url, {
            method: state.currentNavigate && state.currentNavigate.method || 'GET'
        });
    }
});

RouteStore.withStaticRoutes = function (staticRoutes) {
    var staticRouter = new Router(staticRoutes);
    function StaticRouteStore() {
        RouteStore.apply(this, arguments);
        this._router = staticRouter;
    }
    inherits(StaticRouteStore, RouteStore);
    StaticRouteStore.storeName = RouteStore.storeName;
    StaticRouteStore.handlers = RouteStore.handlers;
    StaticRouteStore.routes = staticRoutes || {};
    StaticRouteStore.prototype.getRoutes = function () {
        return Object.assign({}, StaticRouteStore.routes, this._routes || {});
    };
    return StaticRouteStore;
};

module.exports = RouteStore;
