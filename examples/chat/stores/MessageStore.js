/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var ThreadStore = require('./ThreadStore');


var MessageStore = createStore({
    storeName: 'MessageStore',
    handlers: {
        'RECEIVE_MESSAGES': 'receiveMessages',
        'OPEN_THREAD': 'openThread'
    },
    initialize: function () {
        this.messages = {};
        this.sortedByDate = [];
    },
    receiveMessages: function (messages) {
        var self = this;
        messages.forEach(function (message) {
            self.messages[message.id] = message;
        });
        self.sortedByDate = Object.keys(self.messages);
        self.sortedByDate.sort(function(a, b) {
            if (self.messages[a].date < self.messages[b].date) {
                return -1;
            } else if (self.messages[a].date > self.messages[b].date) {
                return 1;
            }
            return 0;
        });
        self.emitChange();
    },
    openThread: function (payload) {
        var self = this;
        // Mark all read
        Object.keys(self.messages).forEach(function (key) {
            var message = self.messages[key];
            if (message.threadID === payload.threadID) {
                message.isRead = true;
            }
        });
        self.emitChange();
    },
    getAll: function () {
        return this.messages;
    },
    get: function (id) {
        return this.messages[id];
    },
    getAllForThread: function(threadID) {
        var self = this;
        var threadMessages = [];
        self.sortedByDate.forEach(function (key) {
            var message = self.messages[key];
            if (message.threadID === threadID) {
                threadMessages.push(message);
            }
        });
        return threadMessages;
    },
    getAllForCurrentThread: function() {
        var currentThreadID = this.dispatcher.getStore(ThreadStore).getCurrentID();
        return this.getAllForThread(currentThreadID);
    },
    dehydrate: function () {
        return {
            messages: this.messages,
            sortedByDate: this.sortedByDate
        };
    },
    rehydrate: function (state) {
        this.messages = state.messages;
        this.sortedByDate = state.sortedByDate;
    }
});


module.exports = MessageStore;
