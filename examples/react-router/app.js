/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import Fluxible from 'fluxible';
import ApplicationStore from './stores/ApplicationStore';
import TimeStore from './stores/TimeStore';
import PageStore from './stores/PageStore';
import Routes from './components/Routes';

const app = new Fluxible({
    component: Routes,
    stores: [ApplicationStore, PageStore, TimeStore],
});

export default app;
