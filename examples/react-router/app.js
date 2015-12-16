/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import Fluxible from 'fluxible';
import ApplicationStore from './stores/ApplicationStore';
import TimeStore from './stores/TimeStore';
import PageStore from './stores/PageStore';

const app = new Fluxible({
    component: require('./components/Routes'),
    stores: [
        ApplicationStore,
        PageStore,
        TimeStore
    ]
});

module.exports = app;
