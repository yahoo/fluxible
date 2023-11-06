/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component, createElement } from 'react';
import FluxibleComponent from './FluxibleComponent';

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
        throw new Error(
            'A top-level component was not passed to the Fluxible constructor.',
        );
    }

    const context = fluxibleContext.getComponentContext();

    if (
        Component.displayName &&
        Component.displayName.includes('contextProvider')
    ) {
        return createElement(Component, { context, ...props });
    }

    const children = createElement(Component, props);
    return createElement(FluxibleComponent, { context }, children);
}

export default createElementWithContext;
