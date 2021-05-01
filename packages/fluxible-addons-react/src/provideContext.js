/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component as ReactComponent, createRef, createElement } from 'react';
import { object } from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { FluxibleProvider } from './FluxibleContext';

/**
 * Provides context prop to all children as React context
 *
 * Example:
 *   const WrappedComponent = provideContext(Component, {
 *       foo: PropTypes.string
 *   });
 *
 * @method provideContext
 * @param {React.Component} [Component] component to wrap
 * @param {array} [plugins] list of plugins names to inject into the context
 * @returns {React.Component}
 */
function provideContext(Component, plugins) {
    class ContextProvider extends ReactComponent {
        constructor(props) {
            super(props);
            this.wrappedElementRef = createRef();
        }

        render() {
            const props =
                Component.prototype && Component.prototype.isReactComponent
                    ? { ref: this.wrappedElementRef }
                    : null;

            const { context } = this.props;
            const children = createElement(Component, {
                ...this.props,
                ...props,
            });
            return createElement(
                FluxibleProvider,
                { context, plugins },
                children
            );
        }
    }

    ContextProvider.propTypes = {
        context: object.isRequired,
    };

    ContextProvider.displayName = `contextProvider(${
        Component.displayName || Component.name || 'Component'
    })`;

    hoistNonReactStatics(ContextProvider, Component);

    return ContextProvider;
}

export default provideContext;
