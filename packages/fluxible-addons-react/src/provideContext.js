/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component as ReactComponent, createRef, createElement } from 'react';
import { func, object } from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

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
 * @returns {React.Component} or {Function} if using decorator pattern
 */
function provideContext(Component) {
    class ContextProvider extends ReactComponent {
        constructor(props) {
            super(props);
            this.wrappedElementRef = createRef();
        }

        getChildContext() {
            const childContext = {
                executeAction: this.props.context.executeAction,
                getStore: this.props.context.getStore
            };
            return childContext;
        }

        render() {
            const props = (Component.prototype && Component.prototype.isReactComponent)
                ? {ref: this.wrappedElementRef}
                : null;
            return createElement(Component, {...this.props, ...props});
        }
    }

    ContextProvider.childContextTypes = {
        executeAction: func.isRequired,
        getStore: func.isRequired,
    };

    ContextProvider.propTypes = {
        context: object.isRequired
    };

    ContextProvider.displayName = `contextProvider(${Component.displayName || Component.name || 'Component'})`;

    hoistNonReactStatics(ContextProvider, Component);

    return ContextProvider;
}

export default provideContext;
