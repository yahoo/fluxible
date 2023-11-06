import React from 'react';
import { connectToStores } from 'fluxible-addons-react';
import AppStore from './AppStore';
import * as actions from './actions';

const RandomNumberGenerator = ({ number, setRandomNumber }) => (
    <div>
        <p>
            <b>Number:</b> {number}
        </p>
        <button onClick={setRandomNumber}>Generate random number</button>
    </div>
);

export default connectToStores(
    RandomNumberGenerator,
    [AppStore],
    (context) => ({
        number: context.getStore(AppStore).getNumber(),
        setRandomNumber: () => context.executeAction(actions.setRandomNumber),
    }),
);
