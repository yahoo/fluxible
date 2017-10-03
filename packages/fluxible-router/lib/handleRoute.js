/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
/*eslint no-func-assign:0 */
'use strict';
var React = require('react');
var PropTypes = require('prop-types');
var connectToStores = require('fluxible-addons-react/connectToStores');
var hoistNonReactStatics = require('hoist-non-react-statics');
var inherits = require('inherits');

function createComponent(Component) {
    function RouteHandler(props, context) {
        React.Component.apply(this, arguments);
    }

    inherits(RouteHandler, React.Component);

    RouteHandler.displayName = 'RouteHandler';
    RouteHandler.contextTypes = {
        getStore: PropTypes.func.isRequired
    };
    RouteHandler.propTypes = {
        currentRoute: PropTypes.object,
        currentNavigate: PropTypes.object,
        currentNavigateError: PropTypes.object,
        isNavigateComplete: PropTypes.bool
    };

    Object.assign(RouteHandler.prototype, {
        render: function () {
            var routeStore = this.context.getStore('RouteStore');
            var props = Component.prototype && Component.prototype.isReactComponent ? {ref: 'wrappedElement'} : null;

            return React.createElement(Component, Object.assign({
                isActive: routeStore.isActive.bind(routeStore),
                makePath: routeStore.makePath.bind(routeStore)
            }, this.props, props));
        }
    });

    RouteHandler = connectToStores(RouteHandler, ['RouteStore'], function (context) {
        var routeStore = context.getStore('RouteStore');
        return {
            currentNavigate: routeStore.getCurrentNavigate(),
            currentNavigateError: routeStore.getCurrentNavigateError(),
            isNavigateComplete: routeStore.isNavigateComplete(),
            currentRoute: routeStore.getCurrentRoute()
        };
    });

    // Copy statics to RouteHandler
    hoistNonReactStatics(RouteHandler, Component);

    RouteHandler.wrappedComponent = RouteHandler.WrappedComponent = Component;

    return RouteHandler;
}

module.exports = function handleRoute(Component) {
    // support decorator pattern
    if (arguments.length === 0) {
        return function handleRouteDecorator(componentToDecorate) {
            return createComponent(componentToDecorate);
        };
    }

    return createComponent.apply(null, arguments);
};
