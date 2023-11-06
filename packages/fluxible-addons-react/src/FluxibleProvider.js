import { createElement } from 'react';
import { node, object } from 'prop-types';
import FluxibleComponentContext from './FluxibleComponentContext';

const FluxibleProvider = ({ children, context }) =>
    createElement(
        FluxibleComponentContext.Provider,
        { value: context },
        children,
    );

FluxibleProvider.propTypes = {
    children: node.isRequired,
    context: object.isRequired,
};

export default FluxibleProvider;
