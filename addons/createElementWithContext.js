/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var React = require('react');
var FluxibleComponent = require('./FluxibleComponent');
var objectAssign = require('object-assign');

/**
 * Creates an instance of the app level component with given props and a proper component
 * context.
 * @param {FluxibleContext} fluxibleContext
 * @param {Object} props
 * @return {ReactElement}
 */
module.exports = function createElement(fluxibleContext, props) {
    var Component = fluxibleContext.getComponent();
    if (!Component) {
        throw new Error('A component was not specified.');
    }
    if ('ContextProvider' === Component.displayName) {
        return React.createElement(Component, objectAssign({}, {
            context: fluxibleContext.getComponentContext()
        }, props));
    }
    var componentInstance = React.createElement(Component, props);
    return React.createElement(FluxibleComponent, {
        context: fluxibleContext.getComponentContext()
    }, componentInstance);
};
