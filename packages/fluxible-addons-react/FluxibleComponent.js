/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var FluxibleComponent = React.createClass({
    displayName: 'FluxibleComponent',
    propTypes: {
        context: React.PropTypes.object.isRequired
    },

    childContextTypes: {
        executeAction: React.PropTypes.func.isRequired,
        getStore: React.PropTypes.func.isRequired
    },

    /**
     * Provides the current context as a child context
     * @method getChildContext
     */
    getChildContext: function () {
        return {
            getStore: this.props.context.getStore,
            executeAction: this.props.context.executeAction
        };
    },

    render: function () {
        return React.cloneElement(this.props.children, {
            context: this.props.context
        });
    }
});

module.exports = FluxibleComponent;
