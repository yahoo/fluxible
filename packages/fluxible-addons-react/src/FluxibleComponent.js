/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import { Component, cloneElement, createElement } from 'react';
import { object, node } from 'prop-types';
import { FluxibleProvider } from './FluxibleContext';

class FluxibleComponent extends Component {
    render() {
        const { children, context } = this.props;
        const childrenWithContext = cloneElement(children, { context });
        return createElement(FluxibleProvider, { context }, childrenWithContext);
    }
}

FluxibleComponent.propTypes = {
    children: node.isRequired,
    context: object.isRequired
};

export default FluxibleComponent;
