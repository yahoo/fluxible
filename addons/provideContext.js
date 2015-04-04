var React = require('react');
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var objectAssign = require('object-assign');
var contextTypes = require('../lib/contextTypes');

/**
 * Provides context prop to all children as React context
 * @method provideContext
 * @param {React.Component} Component component to wrap
 * @param {object} customContextTypes Custom contextTypes to add
 * @returns {React.Component}
 */
module.exports = function provideContext(Component, customContextTypes) {
    var childContextTypes = objectAssign({}, contextTypes, customContextTypes || {});

    var ContextProvider = React.createClass({
        displayName: 'ContextProvider',

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
            return React.createElement(Component, this.props);
        }
    });

    return ContextProvider;
};
