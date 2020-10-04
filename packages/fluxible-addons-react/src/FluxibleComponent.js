/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class FluxibleComponent extends React.Component {
    getChildContext() {
        return {
            getStore: this.props.context.getStore,
            executeAction: this.props.context.executeAction
        };
    }

    render() {
        return React.cloneElement(this.props.children, {
            context: this.props.context
        });
    }
}

FluxibleComponent.propTypes = {
    children: PropTypes.node.isRequired,
    context: PropTypes.object.isRequired
};

FluxibleComponent.childContextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired
};

module.exports = FluxibleComponent;
