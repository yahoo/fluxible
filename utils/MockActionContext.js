/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');

module.exports = function createMockActionContext(Dispatcher) {
    var Dispatcher = Dispatcher || dispatchr();

    function MockActionContext (dispatcher) {
        this.Dispatcher = Dispatcher;
        this.dispatcher = dispatcher || new Dispatcher();
        this.executeActionCalls = [];
        this.dispatchCalls = [];
    }

    MockActionContext.registerStore = Dispatcher.registerStore;

    MockActionContext.prototype.getStore = function (name) {
        return this.dispatcher.getStore(name);
    };

    MockActionContext.prototype.dispatch = function (name, payload) {
        this.dispatchCalls.push({
            name: name,
            payload: payload
        });
        this.dispatcher.dispatch(name, payload);
    };

    MockActionContext.prototype.executeAction = function (action, payload, callback) {
        this.executeActionCalls.push({
            action: action,
            payload: payload
        });
        action(this, payload, callback);
    };

    MockActionContext.Dispatcher = Dispatcher;

    return MockActionContext;
};
