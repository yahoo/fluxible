import { createContext } from 'react';

const throwError = () => {
    throw new Error(
        'Fluxible component context not found. Wrap your component with FluxibleProvider.',
    );
};

export const FluxibleComponentContext = createContext({
    executeAction: throwError,
    getStore: throwError,
});

FluxibleComponentContext.displayName = 'FluxibleComponentContext';

export default FluxibleComponentContext;
