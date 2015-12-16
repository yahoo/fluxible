/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var inherits = require('inherits');

function FluxibleComponent(props, context) {
    React.Component.apply(this, arguments);
}

inherits(FluxibleComponent, React.Component);

FluxibleComponent.displayName = 'FluxibleComponent';
FluxibleComponent.propTypes = {
    context: React.PropTypes.object.isRequired
};
FluxibleComponent.childContextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired
};

Object.assign(FluxibleComponent.prototype, {
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
