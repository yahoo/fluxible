/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Example:openThreadAction');
var ThreadStore = require('../stores/ThreadStore');

module.exports = function (context, payload, done) {
    debug('dispatching OPEN_THREAD', payload);

    /* If thread Id isn't provided make it the latest thread.
     * Called if page loaded at root (/)
     */
    if(!payload.threadID) {
        debug('opening most recent thread');
        var threadStore = context.getStore(ThreadStore);
        var allChrono = threadStore.getAllChrono();
        payload.threadID = allChrono[allChrono.length - 1].id;
    }

    context.dispatch('OPEN_THREAD', payload);
    done();
};
