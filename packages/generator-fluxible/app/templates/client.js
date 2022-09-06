/*global document, window */

import ReactDOM from 'react-dom';
import { createElementWithContext } from 'fluxible-addons-react';
import app from './app';

const dehydratedState = window.App; // Sent from the server

window.React = ReactDOM; // For chrome dev tool support

// pass in the dehydrated server state from server.js
app.rehydrate(dehydratedState, (err, context) => {
    if (err) {
        throw err;
    }
    window.context = context;
    const mountNode = document.getElementById('app');

    ReactDOM.hydrate(createElementWithContext(context), mountNode);
});
