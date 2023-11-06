/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { createElement } from 'react';
import { object } from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import FluxibleProvider from './FluxibleProvider';

/**
 * Provides context prop to all children as React context
 *
 * Example:
 *   const WrappedComponent = provideContext(Component);
 *
 * @function provideContext
 * @param {React.Component} Component - component to wrap.
 * @returns {React.Component}
 */
function provideContext(Component) {
    const ContextProvider = (props) =>
        createElement(
            FluxibleProvider,
            { context: props.context },
            createElement(Component, props),
        );

    ContextProvider.propTypes = {
        context: object.isRequired,
    };

    ContextProvider.displayName = `contextProvider(${
        Component.displayName || Component.name || 'Component'
    })`;

    return hoistNonReactStatics(ContextProvider, Component);
}

export default provideContext;
