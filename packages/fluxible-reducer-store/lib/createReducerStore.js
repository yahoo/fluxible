/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var __DEV__ = process.env.NODE_ENV !== 'production';

function stateIdentity(state) {
    return state;
}

module.exports = function createReducerStore(spec) {
    spec = spec || {};
    var ReducerStore = createStore({
        storeName: spec.storeName,
        handlers: {},
        initialize: function () {
            this.state = spec.initialState;
        },
        getState: function () {
            return this.state;
        },
        dehydrate: function () {
            return (spec.dehydrate || stateIdentity)(this.state);
        },
        rehydrate: function (state) {
            this.state = (spec.rehydrate || stateIdentity)(state);
        },
    });

    function replaceReducers(reducers) {
        spec.reducers = reducers || {};
        // Allow a single reducer function
        if (spec.reducer) {
            spec.reducers = {
                default: spec.reducer,
            };
        }
        // Create a handler proxy for each reducer so that the store can
        // still be lazy instantiated by dispatchr.
        Object.keys(spec.reducers).forEach(function eachReducer(eventName) {
            var reducer = spec.reducers[eventName];
            if (!ReducerStore.handlers[eventName]) {
                ReducerStore.handlers[eventName] = function (
                    payload,
                    dispatchedEventName,
                ) {
                    if (__DEV__) {
                        if (!spec.reducers[eventName]) {
                            // Calling a reducer that has been removed should be
                            // non-fatal, but warning may help with bugs.
                            console.warn(
                                eventName +
                                    ' reducer on ' +
                                    spec.storeName +
                                    ' has been removed.',
                            );
                            return;
                        }
                    }
                    var startingState = this.state;
                    this.state = spec.reducers[eventName](
                        this.state,
                        payload,
                        dispatchedEventName,
                    );
                    if (this.state !== startingState) {
                        this.emitChange();
                    }
                };
            }
        });
    }
    ReducerStore.replaceReducer = replaceReducers;
    ReducerStore.replaceReducers = replaceReducers;

    ReducerStore.replaceGetters = function replaceGetters(getters) {
        spec.getters = getters || {};
        Object.keys(spec.getters).forEach(function (methodName) {
            if (!ReducerStore.prototype[methodName]) {
                ReducerStore.prototype[methodName] = function () {
                    if (__DEV__) {
                        if (!spec.getters[methodName]) {
                            // Calling a method that has been removed would be
                            // fatal, so let's throw a more useful error than
                            // "undefined is not a function"
                            throw new Error(
                                methodName +
                                    ' on ' +
                                    storeName +
                                    ' has been removed but was still called.',
                            );
                        }
                    }
                    var state = this.state;
                    var args = [state].concat(
                        Array.prototype.slice.call(arguments),
                    );
                    return spec.getters[methodName].apply(null, args);
                };
            }
        });
    };

    ReducerStore.replaceSpec = function replaceSpec(spec) {
        spec = spec || {};
        ReducerStore.replaceReducers(spec.reducers);
        ReducerStore.replaceGetters(spec.getters);
    };

    ReducerStore.replaceSpec(spec);

    return ReducerStore;
};
