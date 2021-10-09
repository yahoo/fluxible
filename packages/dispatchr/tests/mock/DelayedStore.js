/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var createStore = require('../../addons/createStore');

module.exports = createStore({
    storeName: 'DelayedStore',
    handlers: {
        DELAY: 'delay',
        default: 'default',
    },
    initialize: function () {
        this.state = {};
        this.called = false;
        this.defaultCalled = false;
        this.actionHandled = null;
    },
    default: function (payload, actionName) {
        this.defaultCalled = true;
        this.actionHandled = actionName;
        this.emitChange();
    },
    delay: function (payload) {
        this.called = true;
        this.state.page = 'delay';
        this.state.final = true;
        this.emitChange();
    },
    getState: function () {
        return this.state;
    },
    dehydrate: function () {
        return this.state;
    },
    rehydrate: function (state) {
        this.state = state;
    },
});
