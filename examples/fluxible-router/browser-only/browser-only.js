/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global App, document, window */
import { render } from 'react-dom';
import debug from 'debug';
import Fluxible from 'fluxible';
import Application from '../components/Application';
import RouteStore from '../stores/RouteStore';
import ApplicationStore from '../stores/ApplicationStore';
import TimeStore from '../stores/TimeStore';
import PageStore from '../stores/PageStore';
import { createElementWithContext } from 'fluxible-addons-react';
import { navigateAction } from 'fluxible-router';

const bootstrapDebug = debug('Example');
const dehydratedState = {};

let app = new Fluxible({
    component: Application,
    stores: [RouteStore, ApplicationStore, TimeStore, PageStore],
});

bootstrapDebug('rehydrating app');
app.rehydrate(dehydratedState, (err, context) => {
    if (err) {
        throw err;
    }
    context.executeAction(
        navigateAction,
        { url: window.location.pathname, type: 'pageload' },
        () => {
            const mountNode = document.getElementById('app');
            window.context = context;
            bootstrapDebug('React Rendering');
            render(createElementWithContext(context, {}), mountNode);
        },
    );
});
