/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import updateTime from '../actions/updateTime';
import TimeStore from '../stores/TimeStore';
import { connectToStores } from 'fluxible-addons-react';

const Timestamp = (props) => (
    <em onClick={props.onClick} style={{ fontSize: '.8em' }}>
        {props.time}
    </em>
);

export default connectToStores(Timestamp, [TimeStore], (context) => ({
    ...context.getStore(TimeStore).getState(),
    onClick: () => context.executeAction(updateTime),
}));
