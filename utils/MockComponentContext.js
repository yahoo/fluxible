/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');
var createMockActionContext = require('./MockActionContext');
function noop () {}

module.exports = function createMockComponentContextClass(Dispatcher) {
    Dispatcher = Dispatcher || dispatchr();
    var MockActionContext = createMockActionContext(Dispatcher);

    function MockComponentContext () {
        this.dispatcher = new Dispatcher();
        this.executeActionCalls = [];
        this.getStore = this.getStore.bind(this);
        this.executeAction = this.executeAction.bind(this);
    }

    MockComponentContext.prototype.getStore = function (name) {
        return this.dispatcher.getStore(name);
    };

    MockComponentContext.prototype.executeAction = function (action, payload) {
        this.executeActionCalls.push({
            action: action,
            payload: payload
        });
        action(new MockActionContext(this.dispatcher), payload, noop);
    };

    MockComponentContext.Dispatcher = Dispatcher;
    MockComponentContext.registerStore = Dispatcher.registerStore;

    return MockComponentContext;
};
