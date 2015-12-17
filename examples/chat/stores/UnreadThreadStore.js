/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var ThreadStore = require('./ThreadStore');


var UnreadThreadStore = createStore({
    storeName: 'UnreadThreadStore',
    handlers: {
        'RECEIVE_MESSAGES': 'receiveMessages',
        'OPEN_THREAD': 'openThread'
    },
    initialize: function () {
        this.messages = {};
    },
    receiveMessages: function (messages) {
        this.emitChange();
    },
    openThread: function (payload) {
        this.emitChange();
    },
    getCount: function () {
        var threads = this.dispatcher.getStore(ThreadStore).getAll();
        var unreadCount = 0;
        for (var id in threads) {
            if (!threads[id].lastMessage.isRead) {
                unreadCount++;
            }
        }
        return unreadCount;
    },
    dehydrate: function () {
        return {};
    },
    rehydrate: function (state) {
        return;
    }
});


module.exports = UnreadThreadStore;
