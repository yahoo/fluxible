/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var createStore = require('../../addons/createStore');

module.exports = createStore({
    storeName: 'NoDehydrateStore',
    handlers: {
        NAVIGATE: 'navigate',
    },
    initialize: function () {
        this.state = {};
        this.called = false;
        this.defaultCalled = false;
        this.actionHandled = null;
    },
    navigate: function (payload, actionName) {
        this.defaultCalled = true;
        this.actionHandled = actionName;
        this.emitChange();
    },
    shouldDehydrate: function () {
        return false;
    },
    dehydrate: function () {
        throw new Error('Dehydrate should not be called on NoDehydrateStore');
    },
    rehydrate: function (state) {
        this.state = state;
    },
});
