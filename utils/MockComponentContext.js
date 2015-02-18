/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');
var MockActionContext = require('./MockActionContext')();

function noop () {}

module.exports = function createMockComponentContextClass() {
    var Dispatcher = dispatchr();

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
        action(new MockActionContext(), payload, noop);
    };

    MockComponentContext.Dispatcher = Dispatcher;

    return MockComponentContext;
};
