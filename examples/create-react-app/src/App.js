import React from 'react';
import { provideContext } from 'fluxible-addons-react';
import RandomNumberGenerator from './RandomNumberGenerator';

const App = () => (
    <div>
        <h1>Fluxible Minimal Example</h1>
        <RandomNumberGenerator />
    </div>
);

export default provideContext(App);
