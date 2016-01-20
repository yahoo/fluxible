/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var batchedUpdates = require('react-dom').unstable_batchedUpdates;

function ChangeManager (context, strategy) {
    var self = this;
    self.context = context;
    self.strategy = strategy;
    self.batch = null;
    self.depth = 0;
    self.transactionInterface = {
        isStarted: function isStarted() {
            return !!self.depth;
        },
        start: self.startTransaction.bind(self),
        end: self.endTransaction.bind(self)
    };
}

ChangeManager.prototype.emit = function emit(storeName, eventName, payload, oldEmit) {
    var self = this;
    self.strategy(self.context, self.transactionInterface, {
        storeName: storeName,
        payload: payload
    });
    if (self.batch === null) {
        batchedUpdates(function updateBatch() {
            oldEmit(eventName, payload);
        });
    } else {
        self.batch.push({
            storeName: storeName,
            eventName: eventName,
            payload: payload,
            oldEmit: oldEmit
        });
    }
};

ChangeManager.prototype.startTransaction = function startTransaction() {
    if (null === this.batch) {
        this.batch = [];
    }
    ++this.depth;
};

ChangeManager.prototype.endTransaction = function endTransaction() {
    var self = this;
    if (--self.depth === 0) {
        if (!self.batch) {
            return;
        }
        batchedUpdates(function updateBatch() {
            self.batch.forEach(self._processEmit, self);
            self.batch = null;
        });
    }
};

ChangeManager.prototype._processEmit = function processEmit(emit) {
    if (emit.oldEmit) {
        emit.oldEmit(emit.eventName, emit.payload);
    }
};

/**
 * Creates a batch update plugin for use with Fluxible
 * @method createBatchedUpdatePlugin
 * @param {Object} options The plugin options
 * @param {Function} options.strategy Method called for each store emit call
 *      that allows starting or ending a transaction.
 * @returns {Object}
 */
module.exports = function createBatchedUpdatePlugin(options) {
    options = options || {};
    var strategy = options.strategy;

    /**
     * @class BatchedUpdatePlugin
     */
    return {
        name: 'BatchedUpdatePlugin',
        plugContext: function plugContext(contextOptions, context) {
            var storeOverrides = {};
            var changeManager = new ChangeManager(context, strategy);
            return {
                /**
                 * Overrides dispatch to ensure all React updates as part
                 * of the dispatch are batched together.
                 * @method plugActionContext
                 * @param {Object} actionContext The FluxibleActionContext
                 * @returns {void}
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    var oldDispatch = actionContext.dispatch;
                    actionContext.dispatch = function () {
                        var args = arguments;
                        batchedUpdates(function () {
                            oldDispatch.apply(actionContext, args);
                        });
                    };
                },
                /**
                 * Overrides store emit to ensure all React updates as part
                 * of the event are batched together. Also allows batching
                 * using a specific strategy.
                 * @method plugComponentContext
                 * @param {Object} componentContext The FluxibleComponentContext
                 * @returns {void}
                 */
                plugComponentContext: function plugComponentContext(componentContext) {
                    var oldGetStore = componentContext.getStore;
                    componentContext.getStore = function getStore(store) {
                        var storeName = typeof store === 'string' ? store : store.storeName || store.name;
                        store = oldGetStore(store);
                        if (!storeOverrides[storeName]) {
                            var oldEmit = store.emit.bind(store);
                            store.emit = function emit(eventName, payload) {
                                changeManager.emit(storeName, eventName, payload, oldEmit);
                            };
                            storeOverrides[storeName] = store;
                        }

                        return storeOverrides[storeName];
                    };
                }
            };
        }
    };
};
