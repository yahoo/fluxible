/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var util = require('util'),
    BaseStore = require('../../addons/BaseStore'),
    DelayedStore = require('./DelayedStore'),
    NoDehydrateStore = require('./NoDehydrate');

function Store(dispatcher) {
    BaseStore.call(this, dispatcher);
}

Store.storeName = 'Store';
util.inherits(Store, BaseStore);

Store.prototype.initialize = function () {
    this.state = {
        called: false,
    };
};

Store.prototype.delay = function (payload) {
    var self = this;
    self.state.called = true;
    self.dispatcher.waitFor(DelayedStore, function () {
        var delayedStore = self.dispatcher.getStore(DelayedStore);
        if (!delayedStore.getState().final) {
            throw new Error("Delayed store didn't finish first!");
        }
        self.state.page = 'delay';
        self.emitChange();
    });
};

Store.prototype.waitFor = function (payload) {
    var self = this;
    self.dispatcher.waitFor(NoDehydrateStore, function () {
        self.state.called = true;
        self.emitChange();
    });
};

Store.prototype.dispatch = function (payload) {
    payload.dispatcher.dispatch('DISPATCH_IN_DISPATCH');
    this.emitChange();
};

Store.prototype.getState = function () {
    return this.state;
};

Store.prototype.dehydrate = function () {
    return this.state;
};

Store.prototype.rehydrate = function (state) {
    this.state = state;
};

Store.prototype.exception = function () {
    throw new Error('Store handler error thrown');
};

Store.handlers = {
    NAVIGATE: function navigate() {
        this.state.called = true;
        this.state.page = 'home';
        this.emitChange();
    },
    DELAY: 'delay',
    ERROR: 'error',
    DISPATCH: 'dispatch',
    WAITFOR: 'waitFor',
    EXCEPTION: 'exception',
};

module.exports = Store;
