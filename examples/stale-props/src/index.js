import React from 'react';
import ReactDOM from 'react-dom';
import { FluxibleProvider } from 'fluxible-addons-react';
import fluxibleApp from './fluxibleApp';
import App from './App';

const context = fluxibleApp.createContext();

ReactDOM.render(
    <React.StrictMode>
        <FluxibleProvider context={context.getComponentContext()}>
            <App />
        </FluxibleProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);
