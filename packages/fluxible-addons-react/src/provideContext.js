/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const hoistNonReactStatics = require('hoist-non-react-statics');

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
 * @param {object} customContextTypes Custom contextTypes to add
 * @returns {React.Component} or {Function} if using decorator pattern
 */
function provideContext(Component, customContextTypes) {
    class ContextProvider extends React.Component {
        constructor(props) {
            super(props);
            this.wrappedElementRef = React.createRef();
        }

        getChildContext() {
            const childContext = {
                executeAction: this.props.context.executeAction,
                getStore: this.props.context.getStore
            };
            if (customContextTypes) {
                Object.keys(customContextTypes).forEach(key => {
                    childContext[key] = this.props.context[key];
                });
            }
            return childContext;
        }

        render() {
            const props = (Component.prototype && Component.prototype.isReactComponent)
                ? {ref: this.wrappedElementRef}
                : null;
            return React.createElement(Component, {...this.props, ...props});
        }
    }

    ContextProvider.childContextTypes = {
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired,
        ...customContextTypes
    };

    ContextProvider.propTypes = {
        context: PropTypes.object.isRequired
    };

    ContextProvider.displayName = `contextProvider(${Component.displayName || Component.name || 'Component'})`;

    hoistNonReactStatics(ContextProvider, Component);

    return ContextProvider;
}

module.exports = provideContext;
