/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function MockActionContext (dispatcherContext) {
    this.dispatcherContext = dispatcherContext;
    this.executeActionCalls = [];
    this.dispatchCalls = [];
}

MockActionContext.prototype.getStore = function (name) {
    return this.dispatcherContext.getStore(name);
};

MockActionContext.prototype.dispatch = function (name, payload) {
    this.dispatchCalls.push({
        name: name,
        payload: payload
    });
    this.dispatcherContext.dispatch(name, payload);
};

MockActionContext.prototype.executeAction = function (action, payload, callback) {
    this.executeActionCalls.push({
        action: action,
        payload: payload
    });
    action(this, payload, callback);
};

module.exports = MockActionContext;
