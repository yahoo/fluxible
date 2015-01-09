/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');

function noop () {}

module.exports = function createMockComponentContextClass() {
    var Dispatcher = dispatchr();

    function MockComponentContext () {
        this.dispatcher = new Dispatcher();
        this.executeActionCalls = [];
    }

    MockComponentContext.prototype.getStore = function (name) {
        return this.dispatcher.getStore(name);
    };

    MockComponentContext.prototype.executeAction = function (action, payload) {
        this.executeActionCalls.push({
            action: action,
            payload: payload
        });
        action(this, payload, noop);
    };

    MockComponentContext.Dispatcher = Dispatcher;

    return MockComponentContext;
};
