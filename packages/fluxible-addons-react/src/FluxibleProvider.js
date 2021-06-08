import { createElement } from 'react';
import { node, object } from 'prop-types';
import { FluxibleContext } from './FluxibleContext';

const FluxibleProvider = ({ children, context }) =>
    createElement(FluxibleContext.Provider, { value: context }, children);

FluxibleProvider.propTypes = {
    children: node.isRequired,
    context: object.isRequired,
};

export default FluxibleProvider;
