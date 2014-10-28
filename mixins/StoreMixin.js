/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * React mixin for staticly declaring and add/remove-ing listeners for Store events.
 * @class StoreMixin
 * @example
 * // Register listener default handler function name
 * var Component = React.createClass({
 *     mixins: [StoreMixin],
 *     statics: {
 *         storeListeners: [MockStore]
 *     },
 *     onChange: function () {
 *         done();
 *     },
 *     ...
 * });
 * @example
 * // Register listener with custom named handler
 * var Component = React.createClass({
 *     mixins: [StoreMixin],
 *     statics: {
 *         storeListeners: {
 *             'onChange2': [MockStore]
 *         }
 *     },
 *     onChange2: function () {
 *         done();
 *     },
 *     ...
 * });
 */
var DEFAULT_CHANGE_HANDLER = 'onChange',
    StoreMixin;

StoreMixin = {
    /**
     * Registers staticly declared listeners
     * @method componentDidMount
     */
    componentDidMount: function componentDidMount() {
        this.listeners = [];
        var self = this;

        // Register static listeners
        this.getListeners().forEach(function(listener) {
            self._attachStoreListener(listener);
        });
    },

    /**
     * Gets a store instance from the context
     * @param {Function|String} store The store to get
     * @returns {Object}
     * @method getStore
     */
    getStore: function (store) {
        var storeInstance = store;
        if ('object' !== typeof storeInstance) {
            if (!this.props.context) {
                throw new Error('storeListener mixin was called but no context was provided for getting the store');
            }
            storeInstance = this.props.context.getStore(store);
        }
        return storeInstance;
    },

    /**
     * Gets from the context all store instances required by this component
     * @returns {Object}
     * @method getStores
     */
    getStores: function() {
        var storesByName = this.getListeners().reduce(function (accum, listener) {
            accum[listener.store.constructor.storeName] = listener.store;
            return accum;
        }, {});
        return Object.keys(storesByName).map(function(storeName) {
            return storesByName[storeName];
        });
    },

    /**
     * Gets a store-change handler from the component
     * @param {Function|String} handler The handler to get
     * @returns {Function}
     * @method getHandler
     */
    getHandler: function (handler) {
        if ('string' === typeof handler) {
            handler = this[handler];
        }

        if (!handler) {
            throw new Error('storeListener attempted to add undefined handler. Make sure handlers are actually exist.');
        }

        return handler;
    },

    /**
     * Gets a listener descriptor for a store and store-change handler
     * @param {Function|String} store Store
     * @param {Function|String} handler The handler function or method name
     * @returns {Object}
     * @method getListener
     */
    getListener: function(store, handler) {
        handler = this.getHandler(handler);
        var storeInstance = this.getStore(store);

        return {
            store: storeInstance,
            handler: handler
        };
    },

    /**
     * Gets all store-change listener descriptors from the component
     * @returns {Object}
     * @method getListeners
     */
    getListeners: function() {
        var self = this;
        var storeListeners = self.constructor.storeListeners; // Static property on component

        // get static listeners
        if (storeListeners) {
            if (Array.isArray(storeListeners)) {
                return storeListeners.map(function(store) {
                    return self.getListener(store, DEFAULT_CHANGE_HANDLER);
                });
            } else {
                return Object.keys(storeListeners).reduce(function (accum, handlerName) {
                    var stores = storeListeners[handlerName];
                    if (!Array.isArray(stores)) {
                        stores = [stores];
                    }
                    return accum.concat(stores.map(function (store) {
                        return self.getListener(store, handlerName);
                    }));
                }, []);
            }
        }

        return [];
    },

    /**
     * If provided with events, will attach listeners to events on EventEmitter objects(i.e. Stores)
     * If the component isn't mounted, events aren't attached.
     * @param {Object} listener
     * @param {Object} listener.store Store instance
     * @param {Object} listener.handler Handler function or method name
     * @method _attachStoreListener
     * @private
     */
    _attachStoreListener: function _attachStoreListener(listener) {
        if (this.isMounted && !this.isMounted()) {
            throw new Error('storeListener mixin called listen when component wasn\'t mounted.');
        }

        listener.store.addChangeListener(listener.handler);
        this.listeners.push(listener);
    },

    /**
     * Removes all listeners
     * @method componentWillUnmount
     */
    componentWillUnmount: function componentWillUnmount() {
        this.listeners.forEach(function (listener) {
            listener.store.removeChangeListener(listener.handler);
        });
        this.listeners = [];
    }
};

module.exports = StoreMixin;
