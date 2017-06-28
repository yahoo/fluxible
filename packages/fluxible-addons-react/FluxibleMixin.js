/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * React mixin for staticly declaring and add/remove-ing listeners for Store events.
 * @class FluxibleMixin
 * @example
 * // Register listener default handler function name
 * var Component = React.createClass({
 *     mixins: [FluxibleMixin],
 *     statics: {
 *         storeListeners: [FooStore]
 *     },
 *     onChange: function () {
 *         this.setState(this.context.getStore(FooStore).getState());
 *     },
 *     ...
 * });
 * @example
 * // Register listener with custom named handler
 * var Component = React.createClass({
 *     mixins: [FluxibleMixin],
 *     statics: {
 *         storeListeners: {
 *             'onChange2': [FooStore]
 *         }
 *     },
 *     onChange2: function () {
 *         this.setState(this.context.getStore(FooStore).getState());
 *     },
 *     ...
 * });
 */
var DEFAULT_CHANGE_HANDLER = 'onChange';
var React = require('react');
var PropTypes = require('prop-types');

var FluxibleMixin = {

    _isMounted: false,

    contextTypes: {
        executeAction: PropTypes.func,
        getStore: PropTypes.func
    },

    /**
     * Registers staticly declared listeners
     * @method componentDidMount
     */
    componentDidMount: function componentDidMount() {
        this._isMounted = true;
        this._fluxible_listeners = [];
        var self = this;

        // Register static listeners
        this.getListeners().forEach(function(listener) {
            self._attachStoreListener(listener);
        });
    },

    /**
     * Calls an action
     * @method executeAction
     */
    executeAction: function executeAction() {
        var context = this.props.context || this.context;
        if (!context || !context.executeAction) {
            throw new Error('executeAction was called but no context was provided. Pass the fluxible ' +
            'context via a `context` prop or via React\'s context.');
        }
        return context.executeAction.apply(context, arguments);
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
            var context = this.props.context || this.context;
            if (!context) {
                throw new Error('storeListener mixin was called but no context was provided for getting the store. ' +
                'Pass the fluxible context via a `context` prop or via React\'s context.');
            }
            storeInstance = context.getStore(store);
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
            throw new Error('storeListener attempted to add undefined handler. Make sure handlers actually exist.');
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
        if (!this._isMounted) {
            throw new Error('storeListener mixin called listen when component wasn\'t mounted.');
        }

        listener.store.on('change', listener.handler);
        this._fluxible_listeners.push(listener);
    },

    /**
     * Removes all listeners
     * @method componentWillUnmount
     */
    componentWillUnmount: function componentWillUnmount() {
        if (Array.isArray(this._fluxible_listeners)) {
            this._fluxible_listeners.forEach(function (listener) {
                listener.store.removeListener('change', listener.handler);
            });
        }
        this._isMounted = false;
        this._fluxible_listeners = [];
    }
};

module.exports = FluxibleMixin;
