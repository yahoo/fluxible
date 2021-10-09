import ReactDOM from 'react-dom';
import { createElementWithContext } from 'fluxible-addons-react';
import fluxibleApp from './fluxibleApp';

fluxibleApp.rehydrate(window.FLUXIBLE_STATE, (err, context) => {
    if (err) {
        throw err;
    }

    const container = document.getElementById('root');
    const element = createElementWithContext(context);
    ReactDOM.render(element, container);
});
