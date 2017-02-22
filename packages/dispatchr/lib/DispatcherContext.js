/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Action = require('./Action');
var DEFAULT = 'default';
var debug = require('debug')('Dispatchr:DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} context The context to be used for store instances
 * @constructor
 */
function DispatcherContext (dispatcher, context) {
    this.context = context;
    this.dispatcher = dispatcher;
    this.storeInstances = {};
    this.currentAction = null;
    this.dispatcherInterface = {
        getContext: function getContext() { return context; },
        getStore: this.getStore.bind(this),
        waitFor: this.waitFor.bind(this)
    };
    this.rehydratedStoreState = {};
}

/**
 * Returns a single store instance and creates one if it doesn't already exist
 * @method getStore
 * @param {String} name The name of the instance
 * @returns {Object} The store instance
 * @throws {Error} if store is not registered
 */
DispatcherContext.prototype.getStore = function getStore(name) {
    var storeName = this.dispatcher.getStoreName(name);
    if (!this.storeInstances[storeName]) {
        var Store = this.dispatcher.stores[storeName];
        if (!Store) {
            var message = 'Store ' + storeName + ' was not registered.';
            var meta = {
                storeName: storeName
            };
            return this.dispatcher._throwOrCallErrorHandler(message, 'STORE_UNREGISTERED', this.context, meta);
        }
        this.storeInstances[storeName] = new (this.dispatcher.stores[storeName])(this.dispatcherInterface);
        if (this.rehydratedStoreState && this.rehydratedStoreState[storeName]) {
            var state = this.rehydratedStoreState[storeName];
            if (this.storeInstances[storeName].rehydrate) {
                this.storeInstances[storeName].rehydrate(state);
            }
            this.rehydratedStoreState[storeName] = null;
        }
    }
    return this.storeInstances[storeName];
};

/**
 * Dispatches a new action or throws if one is already in progress
 * @method dispatch
 * @param {String} actionName Name of the action to be dispatched
 * @param {Object} payload Parameters to describe the action
 * @throws {Error} if store has handler registered that does not exist
 */
DispatcherContext.prototype.dispatch = function dispatch(actionName, payload) {
    if (!actionName) {
        var message = 'actionName parameter `' + actionName + '` is invalid.';
        return this.dispatcher._throwOrCallErrorHandler(message, 'DISPATCH_INVALID_ACTIONNAME', this.context);
    }
    if (this.currentAction) {
        var message = 'Cannot call dispatch while another dispatch is executing. Attempted to execute \'' + actionName + '\' but \'' + this.currentAction.name + '\' is already executing.';
        var meta = {
            actionName: actionName,
            payload: payload
        };
        return this.dispatcher._throwOrCallErrorHandler(message, 'DISPATCH_EXECUTING', this.context, meta);
    }
    var actionHandlers = this.dispatcher.handlers[actionName] || [],
        defaultHandlers = this.dispatcher.handlers[DEFAULT] || [];
    if (!actionHandlers.length && !defaultHandlers.length) {
        debug(actionName + ' does not have any registered handlers');
        return;
    }
    debug('dispatching ' + actionName, payload);
    this.currentAction = new Action(actionName, payload);
    var self = this,
        allHandlers = actionHandlers.concat(defaultHandlers),
        handlerFns = {};

    try {
        allHandlers.forEach(function actionHandlersEach(store) {
            if (handlerFns[store.name]) {
                // Don't call the default if the store has an explicit action handler
                return;
            }
            var storeInstance = self.getStore(store.name);
            if ('function' === typeof store.handler) {
                handlerFns[store.name] = store.handler.bind(storeInstance);
            } else {
                if (!storeInstance[store.handler]) {
                    var message = store.name + ' does not have a method called ' + store.handler;
                    var meta = {
                        store: store
                    };
                    return this.dispatcher._throwOrCallErrorHandler(message, 'DISPATCH_INVALID_STORE_METHOD', this.context, meta);
                }
                handlerFns[store.name] = storeInstance[store.handler].bind(storeInstance);
            }
        });
        this.currentAction.execute(handlerFns);
    } catch (e) {
        throw e;
    } finally {
        debug('finished ' + actionName);
        this.currentAction = null;
    }
};

/**
 * Returns a raw data object representation of the current state of the
 * dispatcher and all store instances. If the store implements a shouldDehdyrate
 * function, then it will be called and only dehydrate if the method returns `true`
 * @method dehydrate
 * @returns {Object} dehydrated dispatcher data
 */
DispatcherContext.prototype.dehydrate = function dehydrate() {
    var self = this,
        stores = {};
    Object.keys(self.storeInstances).forEach(function storeInstancesEach(storeName) {
        var store = self.storeInstances[storeName];
        if (!store.dehydrate || (store.shouldDehydrate && !store.shouldDehydrate())) {
            return;
        }
        stores[storeName] = store.dehydrate();
    });
    return {
        stores: stores
    };
};

/**
 * Takes a raw data object and rehydrates the dispatcher and store instances
 * @method rehydrate
 * @param {Object} dispatcherState raw state typically retrieved from `dehydrate`
 *      method
 */
DispatcherContext.prototype.rehydrate = function rehydrate(dispatcherState) {
    var self = this;
    if (dispatcherState.stores) {
        Object.keys(dispatcherState.stores).forEach(function storeStateEach(storeName) {
            self.rehydratedStoreState[storeName] = dispatcherState.stores[storeName];
        });
    }
};

/**
 * Waits until all stores have finished handling an action and then calls
 * the callback
 * @method waitFor
 * @param {String|String[]} stores An array of stores as strings to wait for
 * @param {Function} callback Called after all stores have completed handling their actions
 * @throws {Error} if there is no action dispatching
 */
DispatcherContext.prototype.waitFor = function waitFor(stores, callback) {
    if (!this.currentAction) {
        var message = 'waitFor called even though there is no action dispatching';
        var meta = {
            stores: stores
        };
        return this.dispatcher._throwOrCallErrorHandler(message, 'WAITFOR_NO_ACTION', this.context, meta);
    }
    this.currentAction.waitFor(stores, callback);
};

module.exports = DispatcherContext;
