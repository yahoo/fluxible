/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var PageStore = createStore({
    storeName: 'PageStore',
    initialize: function () {
        this.content = 'initial content...';
    },
    handleContentChange: function (payload) {
        this.content = 'content for page with id '+payload.id;
        this.emitChange();
    },
    handlers: {
        'LOAD_PAGE': 'handleContentChange'
    },
    getState: function () {
        return {
            content: this.content
        };
    },
    dehydrate: function () {
        return this.getState();
    },
    rehydrate: function (state) {
        this.content = state.content;
    }
});

module.exports = PageStore;
