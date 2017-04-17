/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var hoistNonReactStatics = require('hoist-non-react-statics');
var inherits = require('inherits');

function createComponent(Component, customContextTypes) {
    var componentName = Component.displayName || Component.name || 'Component';
    var childContextTypes = Object.assign({
        executeAction: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    }, customContextTypes || {});

    function ContextProvider(props, context) {
        React.Component.apply(this, arguments);
    }

    inherits(ContextProvider, React.Component);

    ContextProvider.displayName = 'contextProvider(' + componentName + ')';
    ContextProvider.propTypes = {
        context: PropTypes.object.isRequired
    };
    ContextProvider.childContextTypes = childContextTypes;

    Object.assign(ContextProvider.prototype, {
        getChildContext: function () {
            var childContext = {
                executeAction: this.props.context.executeAction,
                getStore: this.props.context.getStore
            };
            if (customContextTypes) {
                Object.keys(customContextTypes).forEach(function (key) {
                    childContext[key] = this.props.context[key];
                }, this);
            }
            return childContext;
        },

        render: function () {
            var props = Component.prototype && Component.prototype.isReactComponent ? {ref: 'wrappedElement'} : null;
            return React.createElement(Component, Object.assign({}, this.props, props));
        }
    });

    hoistNonReactStatics(ContextProvider, Component);

    return ContextProvider;
}

/**
 * Provides context prop to all children as React context
 *
 * Example:
 *   var WrappedComponent = provideContext(Component, {
 *       foo: PropTypes.string
 *   });
 *
 * Also supports the decorator pattern:
 *   @provideContext({
 *       foo: PropTypes.string
 *   })
 *   class ConnectedComponent extends React.Component {
 *       render() {
 *           return <div/>;
 *       }
 *   }
 *
 * @method provideContext
 * @param {React.Component} [Component] component to wrap
 * @param {object} customContextTypes Custom contextTypes to add
 * @returns {React.Component} or {Function} if using decorator pattern
 */
module.exports = function provideContext(Component, customContextTypes) {
    // support decorator pattern
    if (arguments.length === 0 || typeof arguments[0] !== 'function') {
        customContextTypes = arguments[0];
        return function connectToStoresDecorator(ComponentToDecorate) {
            return createComponent(ComponentToDecorate, customContextTypes);
        };
    }

    return createComponent.apply(null, arguments);
};
