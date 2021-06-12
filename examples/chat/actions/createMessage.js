/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Example:createMessageAction');
var ThreadStore = require('../stores/ThreadStore');

module.exports = function (context, payload, done) {
    var threadStore = context.getStore(ThreadStore);
    var message = threadStore.createMessage({
        timestamp: Date.now(),
        authorName: 'Bill', // hard coded for the example
        isRead: true,
        text: payload.text
    });
    debug('dispatching RECEIVE_MESSAGES', message);
    context.dispatch('RECEIVE_MESSAGES', [message]);
    context.service.create('message', message, {}, function (err) {
        if (err) {
            debug('dispatching RECEIVE_MESSAGES_FAILURE', message);
            context.dispatch('RECEIVE_MESSAGES_FAILURE', [message]);
            done();
            return;
        }
        debug('dispatching RECEIVE_MESSAGES_SUCCESS', message);
        context.dispatch('RECEIVE_MESSAGES_SUCCESS', [message]);
        done();
    });
};
