import { createContext, createElement } from 'react';
import { node, object } from 'prop-types';

const throwError = () => {
    throw new Error(
        'Fluxible context not found. Wrap your component with Fluxible component or provideContext.'
    );
};

export const FluxibleContext = createContext({
    executeAction: throwError,
    getStore: throwError,
});

FluxibleContext.displayName = 'FluxibleContext';

export const FluxibleProvider = ({ children, context }) =>
    createElement(FluxibleContext.Provider, { value: context }, children);

FluxibleProvider.propTypes = {
    children: node.isRequired,
    context: object.isRequired,
};
