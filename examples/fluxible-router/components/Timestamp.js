/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import updateTime from '../actions/updateTime';
import TimeStore from '../stores/TimeStore';
import { connectToStores } from 'fluxible-addons-react';

const Timestamp = ({ onClick, time }) => (
    <em onClick={onClick} style={{ fontSize: '.8em' }}>
        {time}
    </em>
);

export default connectToStores(Timestamp, [TimeStore], (context) => {
    const timeStore = context.getStore(TimeStore);
    const { time } = timeStore.getState();
    const onClick = () => context.executeAction(updateTime);
    return { time, onClick };
});
