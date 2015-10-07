/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var createMockActionContext = require('./createMockActionContext');
function noop () {}

function MockComponentContext (dispatcherContext) {
    this.dispatcherContext = dispatcherContext;
    this.executeActionCalls = [];
    this.getStore = this.getStore.bind(this);
    this.executeAction = this.executeAction.bind(this);
}

MockComponentContext.prototype.getStore = function (name) {
    return this.dispatcherContext.getStore(name);
};

MockComponentContext.prototype.executeAction = function (action, payload) {
    this.executeActionCalls.push({
        action: action,
        payload: payload
    });
    action(createMockActionContext({
        dispatcherContext: this.dispatcherContext
    }), payload, noop);
};

module.exports = MockComponentContext;
