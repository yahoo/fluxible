/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint no-func-assign:0 */
/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from 'prop-types';
import {
    connectToStores,
    FluxibleComponentContext,
} from 'fluxible-addons-react';
import hoistNonReactStatics from 'hoist-non-react-statics';

function handleRoute(Component) {
    let RouteHandler = class extends React.Component {
        render() {
            const routeStore = this.context.getStore('RouteStore');

            return React.createElement(
                Component,
                Object.assign(
                    {
                        isActive: routeStore.isActive.bind(routeStore),
                        makePath: routeStore.makePath.bind(routeStore),
                    },
                    this.props,
                ),
            );
        }
    };

    RouteHandler.displayName = 'RouteHandler';
    RouteHandler.contextType = FluxibleComponentContext;
    RouteHandler.propTypes = {
        currentRoute: PropTypes.object,
        currentNavigate: PropTypes.object,
        currentNavigateError: PropTypes.object,
        isNavigateComplete: PropTypes.bool,
    };

    RouteHandler = connectToStores(
        RouteHandler,
        ['RouteStore'],
        function (context) {
            const routeStore = context.getStore('RouteStore');
            return {
                currentNavigate: routeStore.getCurrentNavigate(),
                currentNavigateError: routeStore.getCurrentNavigateError(),
                isNavigateComplete: routeStore.isNavigateComplete(),
                currentRoute: routeStore.getCurrentRoute(),
            };
        },
    );

    hoistNonReactStatics(RouteHandler, Component);

    RouteHandler.wrappedComponent = RouteHandler.WrappedComponent = Component;

    return RouteHandler;
}

export default handleRoute;
