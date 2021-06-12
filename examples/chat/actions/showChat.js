/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Example:showChatAction');
var MessageStore = require('../stores/MessageStore');
var openThread = require('../actions/openThread');

function fetchMessages(context, payload, done) {
    debug('fetching messages');
    context.service.read('message', {}, {}, function (err, messages) {
        context.dispatch('RECEIVE_MESSAGES', messages);
        context.executeAction(openThread, payload, function() {
            context.dispatch('SHOW_CHAT_END');
            done();
        })
    });

}

module.exports = function (context, payload, done) {
    context.dispatch('SHOW_CHAT_START');
    var messageStore = context.getStore(MessageStore);

    if (Object.keys(messageStore.getAll()).length === 0) {
        fetchMessages(context, payload, done);
    } else {
        debug('dispatching SHOW_CHAT_END');
        context.dispatch('SHOW_CHAT_END');
        done();
    }
};
