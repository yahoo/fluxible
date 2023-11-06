/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import { connectToStores, provideContext } from 'fluxible-addons-react';
import { handleHistory } from 'fluxible-router';
import Nav from './Nav';
import Timestamp from './Timestamp';
import ApplicationStore from '../stores/ApplicationStore';

const Application = ({ currentRoute, pageTitle }) => {
    const Handler = currentRoute.handler;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <div>
                <Nav />
                <Handler />
                <Timestamp />
            </div>
        </>
    );
};

export default provideContext(
    handleHistory(
        connectToStores(Application, [ApplicationStore], (context) => ({
            ...context.getStore(ApplicationStore).getState(),
        })),
        { enableScroll: false },
    ),
);
