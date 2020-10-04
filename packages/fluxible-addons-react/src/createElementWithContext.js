/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

const React = require('react');
const FluxibleComponent = require('./FluxibleComponent');

/**
 * Creates an instance of the app level component with given props and a proper component
 * context.
 * @param {FluxibleContext} fluxibleContext
 * @param {Object} props
 * @return {ReactElement}
 */
function createElementWithContext(fluxibleContext, props) {
    const Component = fluxibleContext.getComponent();
    if (!Component) {
        throw new Error('A top-level component was not passed to the Fluxible constructor.');
    }
    if (Component.displayName && Component.displayName.includes('contextProvider')) {
        return React.createElement(
            Component,
            {context: fluxibleContext.getComponentContext(), ...props},
        );
    }
    const componentInstance = React.createElement(Component, props);
    return React.createElement(
        FluxibleComponent,
        {context: fluxibleContext.getComponentContext()},
        componentInstance
    );
}

module.exports = createElementWithContext;
