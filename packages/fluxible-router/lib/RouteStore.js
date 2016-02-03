/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons/createStore');
var Router = require('routr');
var queryString = require('query-string');
var inherits = require('inherits');

var searchPattern = /\?([^\#]*)/;

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
        this._currentUrl = null;
        this._currentRoute = null;
        this._currentNavigate = null;
        this._currentNavigateError = null;
        this._isNavigateComplete = null;
        this._router = null;
    },
    _handleNavigateStart: function (navigate) {
        var matchedRoute = this._matchRoute(navigate.url, {
            navigate: navigate,
            method: navigate.method
        });

        this._currentRoute = matchedRoute;
        this._currentNavigate = navigate;
        this._currentNavigateError = null;
        this._isNavigateComplete = false;
        this._currentUrl = navigate.url;
        this.emitChange();
    },
    _handleNavigateSuccess: function (route) {
        // Ignore successes from past navigations that have been superceded
        if (
            this._isNavigateComplete ||
            (this._currentNavigate && route.navigate && route.navigate.transactionId !== this._currentNavigate.transactionId)
        ) {
            return;
        }

        this._isNavigateComplete = true;
        this.emitChange();
    },
    _handleNavigateFailure: function (error) {
        // Ignore failures from past navigations that have been superceded
        if (
            this._isNavigateComplete ||
            (this._currentNavigate && error.transactionId !== this._currentNavigate.transactionId)
        ) {
            return;
        }

        this._isNavigateComplete = true;
        this._currentNavigateError = error;
        this.emitChange();
    },
    _handleReceiveRoutes: function (payload) {
        this._routes = Object.assign(this._routes || {}, payload);
        // Reset the router so that it is recreated next time it's needed
        this._router = null;
        this.emitChange();
    },
    _matchRoute: function (url, options) {
        var self = this;
        var route = self.getRouter().getRoute(url, options);
        if (!route) {
            return null;
        }

        var newRoute = Object.assign({}, route.config, {
            name: route.name,
            url: route.url,
            params: route.params,
            navigate: route.navigate,
            query: self._parseQueryString(route.url)
        });

        return newRoute;
    },
    _areEqual: function (route1, route2) {
        var url1 = route1 && route1.url;
        var url2 = route2 && route2.url;

        return url1 === url2;
    },
    _parseQueryString: function (url) {
        var matches = url.match(searchPattern);
        var search;
        if (matches) {
            search = matches[1];
        }
        return (search && queryString.parse(search)) || {};
    },
    makePath: function (routeName, params) {
        return this.getRouter().makePath(routeName, params);
    },
    getCurrentRoute: function () {
        return this._currentRoute;
    },
    getCurrentNavigate: function () {
        return this._currentNavigate;
    },
    getCurrentNavigateError: function () {
        return this._currentNavigateError;
    },
    isNavigateComplete: function () {
        return this._isNavigateComplete;
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
        return this._currentUrl === href;
    },
    dehydrate: function () {
        return {
            currentUrl: this._currentUrl,
            currentNavigate: this._currentNavigate,
            currentNavigateError: this._currentNavigateError,
            isNavigateComplete: this._isNavigateComplete,
            routes: this._routes
        };
    },
    rehydrate: function (state) {
        this._routes = state.routes;
        if (this._routes) {
            this._router = null;
        }
        this._currentUrl = state.currentUrl;
        this._currentRoute = this._matchRoute(this._currentUrl, {
            method: state.currentNavigate && state.currentNavigate.method || 'GET'
        });
        this._currentNavigate = state.currentNavigate;
        this._isNavigateComplete = state.isNavigateComplete;
        this._currentNavigateError = state.currentNavigateError;
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
