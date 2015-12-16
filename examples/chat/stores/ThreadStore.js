/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;


var ThreadStore = createStore({
    storeName: 'ThreadStore',
    handlers: {
        'RECEIVE_MESSAGES': 'receiveMessages',
        'OPEN_THREAD': 'openThread'
    },
    initialize: function () {
        this.currentID = null;
        this.threads = {};
    },
    openThread: function (payload) {
        this.currentID = payload.threadID;
        this.threads[this.currentID].lastMessage.isRead = true;
        this.emitChange();
    },
    get: function(id) {
        return this.threads[id];
    },
    getAll: function() {
        return this.threads;
    },
    getAllChrono: function() {
        var self = this;
        var orderedThreads = [];

        Object.keys(this.threads).forEach(function (key) {
            var thread = self.threads[key];
            orderedThreads.push(thread);
        });

        orderedThreads.sort(function(a, b) {
            if (a.lastMessage.date < b.lastMessage.date) {
                return -1;
            } else if (a.lastMessage.date > b.lastMessage.date) {
                return 1;
            }
            return 0;
        });
        return orderedThreads;
    },
    getCurrentID: function() {
        return this.currentID;
    },
    getCurrentThreadName: function() {
        return this.threads[this.currentID].name;
    },
    getCurrent: function() {
        return this.get(this.getCurrentID());
    },
    createMessage: function(details) {
        return {
            id: String('m_' + details.timestamp),
            threadID: this.getCurrentID(),
            threadName: String(this.getCurrentThreadName()),
            authorName: String(details.authorName),
            timestamp: parseInt(details.timestamp, 10),
            text: String(details.text),
            isRead: !!details.isRead
        };
    },
    receiveMessages: function (messages) {
        var self = this;
        this.dispatcher.waitFor('MessageStore', function () {
            messages.forEach(function(message) {
                var threadID = message.threadID;
                var thread = self.threads[threadID];
                if (thread && thread.lastTimestamp > message.timestamp) {
                    return;
                }
                self.threads[threadID] = {
                    id: threadID,
                    name: message.threadName,
                    lastMessage: message
                };
            });
            self.emitChange();
        });
    },
    dehydrate: function () {
        return {
            currentID: this.currentID,
            threads: this.threads
        };
    },
    rehydrate: function (state) {
        this.currentID = state.currentID;
        this.threads = state.threads;
    }
});


module.exports = ThreadStore;
