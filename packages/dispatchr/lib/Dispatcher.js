/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var DEFAULT = 'default';
var DispatcherContext = require('./DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} options Dispatcher options
 * @param {Array} options.stores Array of stores to register
 * @param {Function} options.errorHandler Called when an error occurrs. Allows user to handle/throw the error.
 * @constructor
 */
function Dispatcher (options) {
    options = options || {};
    options.stores = options.stores || [];
    this.stores = {};
    this.handlers = {};
    this.handlers[DEFAULT] = [];
    this.errorHandler = options.errorHandler;
    this.hasWarnedAboutNameProperty = false;
    options.stores.forEach(function (store) {
        this.registerStore(store);
    }, this);

}

Dispatcher.prototype.createContext = function createContext(context) {
    return new DispatcherContext(this, context);
};

/**
 * Registers a store so that it can handle actions.
 * @method registerStore
 * @static
 * @param {Object} store A store class to be registered. The store should have a static
 *      `name` property so that it can be loaded later.
 * @throws {Error} if store is invalid
 * @throws {Error} if store is already registered
 */
Dispatcher.prototype.registerStore = function registerStore(store) {
    if ('function' !== typeof store) {
        var message = 'registerStore requires a constructor as first parameter';
        return this._throwOrCallErrorHandler(message, 'REGISTER_STORE_NO_CONSTRUCTOR');
    }
    var storeName = this.getStoreName(store);
    if (!storeName) {
        var message = 'Store is required to have a `storeName` property.';
        return this._throwOrCallErrorHandler(message, 'REGISTER_STORE_NO_STORENAME');
    }
    if (this.stores[storeName]) {
        if (this.stores[storeName] === store) {
            // Store is already registered, nothing to do
            return;
        }
        var message = 'Store with name `' + storeName + '` has already been registered. ' +
            'Make sure you do not have multiple copies of the store installed.';
        return this._throwOrCallErrorHandler(message, 'REGISTER_STORE_DUPLICATE_REGISTERED');
    }
    this.stores[storeName] = store;
    if (store.handlers) {
        Object.keys(store.handlers).forEach(function storeHandlersEach(action) {
            var handler = store.handlers[action];
            this._registerHandler(action, storeName, handler);
        }, this);
    }
};

/**
 * Method to discover if a storeName has been registered
 * @method isRegistered
 * @static
 * @param {Object|String} store The store to check
 * @returns {boolean}
 */
Dispatcher.prototype.isRegistered = function isRegistered(store) {
    var storeName = this.getStoreName(store),
        storeInstance = this.stores[storeName];

    if (!storeInstance) {
        return false;
    }

    if ('function' === typeof store) {
        if (store !== storeInstance) {
            return false;
        }
    }
    return true;
};

/**
 * Gets a name from a store
 * @method getStoreName
 * @static
 * @param {String|Object} store The store name or class from which to extract
 *      the name
 * @returns {String}
 */
Dispatcher.prototype.getStoreName = function getStoreName(store) {
    if ('string' === typeof store) {
        return store;
    }
    if (store.storeName) {
        return store.storeName;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (store.name && !this.hasWarnedAboutNameProperty) {
            console.warn('A store has been registered that relies on the ' +
                'constructor\'s name property. This name may change when you ' +
                'minify your stores during build time and could break string ' +
                'references to your store. It is advised that you add a ' +
                'static `storeName` property to your store to ensure the ' +
                'store name does not change during your build.');
            this.hasWarnedAboutNameProperty = true;
        }
    }
    return store.name;
};

/**
 * Adds a handler function to be called for the given action
 * @method registerHandler
 * @private
 * @static
 * @param {String} action Name of the action
 * @param {String} name Name of the store that handles the action
 * @param {String|Function} handler The function or name of the method that handles the action
 * @returns {number}
 */
Dispatcher.prototype._registerHandler = function registerHandler(action, name, handler) {
    this.handlers[action] = this.handlers[action] || [];
    this.handlers[action].push({
        name: this.getStoreName(name),
        handler: handler
    });
    return this.handlers.length - 1;
};

/**
 * Executes `errorHandler` if registered, otherwise will throw an error
 * @method _throwOrCallErrorHandler
 * @private
 * @static
 * @param {String} message Error message to use for throw
 * @param {String} [type=DISPATCHER_ERROR] Type of error generated
 * @param {Object} [context] DispatcherContext object
 * @param {Object} [meta] Additional information to pass to the error handler. Message
    will automatically be passed into the meta object.
 * @throws {Error} if `errorHandler` is not defined
 * @returns {void}
 */
Dispatcher.prototype._throwOrCallErrorHandler = function throwOrCallErrorHandler(message, type, context, meta) {
    if (this.errorHandler) {
        this.errorHandler({
            message: message,
            type: type || 'DISPATCHER_ERROR',
            meta: meta
        }, context);
    } else {
        throw new Error(message);
    }
};

module.exports = {
    createDispatcher: function (options) {
        return new Dispatcher(options);
    }
};
