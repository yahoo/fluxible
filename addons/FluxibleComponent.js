/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react/addons');
var contextTypes = require('../lib/contextTypes');

var FluxibleComponent = React.createClass({
    displayName: 'FluxibleComponent',
    propTypes: {
        context: React.PropTypes.object.isRequired
    },

    childContextTypes: contextTypes,

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
        return React.addons.cloneWithProps(this.props.children, {
            context: this.props.context
        });
    }
});

module.exports = FluxibleComponent;
