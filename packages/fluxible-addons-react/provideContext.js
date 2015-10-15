/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var hoistNonReactStatics = require('hoist-non-react-statics');

function createComponent(Component, customContextTypes) {
    var componentName = Component.displayName || Component.name;
    var childContextTypes = Object.assign({
        executeAction: React.PropTypes.func.isRequired,
        getStore: React.PropTypes.func.isRequired
    }, customContextTypes || {});

    var ContextProvider = React.createClass({
        displayName: componentName + 'ContextProvider',

        propTypes: {
            context: React.PropTypes.object.isRequired
        },

        childContextTypes: childContextTypes,

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
            return React.createElement(Component, Object.assign({}, this.props, { ref: 'wrappedElement' }));
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
 *       foo: React.PropTypes.string
 *   });
 *
 * Also supports the decorator pattern:
 *   @provideContext({
 *       foo: React.PropTypes.string
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
