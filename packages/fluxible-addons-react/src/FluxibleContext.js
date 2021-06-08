import { createContext } from 'react';

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
