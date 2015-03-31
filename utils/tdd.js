/**
 * Copyright 2014, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mockActionContext = require('./MockActionContext');
var mockComponentContext = require('./MockComponentContext');
var assert = require('assert');

function createContextFn(mockContext) {
    return function (options) {
        options = options || {};
        var Context = mockContext();

        // Set store Stores
        if (options.store) {
            options.stores = [options.store];
        }

        // Register Stores
        options.stores && options.stores.forEach(function (Store) {
            Context.Dispatcher.registerStore(Store);
        });

        return new Context();
    };
}

var createActionContext = createContextFn(mockActionContext);
var createComponentContext = createContextFn(mockComponentContext);

module.exports = {
    // Creates context objects
    createActionContext: createActionContext,
    createComponentContext: createComponentContext,

    // Asserts that a store has emmited a change event
    assertStoreChange: function assertStoreChange(store, handler, payload) {
        var emmited;

        store.emitChange = function () {
            emmited = true;
        }

        store[store.constructor.handlers[handler] || handler](payload);
        assert(emmited, 'event was not emmited by store')
    },

    // Asserts that a store has NOT emmited a change event
    assertStoreNotChange: function assertStoreChange(store, handler, payload) {
        var emmited;

        store.emitChange = function () {
            emmited = true;
        }

        store[store.constructor.handlers[handler] || handler](payload);
        assert(!emmited, 'event was emmited by store')
    },

    // Asserts that an action was dispatched
    assertDispatch: function (action, options, handlers, payloads) {
        var context = createActionContext(options);
        var service = options.service;
        var params = options.params || service.data;
        var done;

        if (service) {
            context.service.setService(service.name, function () {
                // pops the callback
                [].pop.call(arguments)(service.err, service.data);
            });
        }

        // Call the action
        action(context, params, function () {
            done = true;
        });

        // Assert that handlers are dispatched
        handlers = Array.isArray(handlers) ? handlers : [handlers];
        handlers.forEach(function (handler, i) {
            assert.deepEqual(context.dispatchCalls[i].name, handler);
        });

        // Assert that payloads are dispatched
        payloads = Array.isArray(payloads) ? payloads : [payloads];
        payloads.forEach(function (payload, i) {
            assert.deepEqual(context.dispatchCalls[i].payload, payload);
        });

        // Assert that done was called
        assert(done, 'done callback was not called');
    }
};
