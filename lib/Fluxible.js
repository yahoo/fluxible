/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Fluxible');
var PromiseLib = global.Promise || require('es6-promise').Promise;
var isPromise = require('is-promise');
var FluxibleContext = require('./FluxibleContext');
var dispatchr = require('dispatchr');

/**
 * Provides a structured way of registering an application's configuration and
 * resources.
 * @class Fluxible
 * @param {Object} [options]
 * @param {Object} [options.component] Stores your top level React component for access using `getComponent()`
 * @param {Function} [options.componentActionHandler] App level component action handler
 * @constructor
 *
 * @example
 *      var app = new Fluxible({
 *          component: require('./components/App.jsx')
 *      });
 */
function Fluxible(options) {
    debug('Fluxible instance instantiated', options);
    options = options || {};

    // Options
    this._component = options.component;
    this._componentActionHandler = options.componentActionHandler || this._defaultComponentActionHandler;
    this._plugins = [];

    // Initialize dependencies
    this._dispatcher = dispatchr.createDispatcher(options);
}

Fluxible.Promise = PromiseLib;

/**
 * Creates an isolated context for a request/session
 * @method createContext
 * @param {Object} [options]
 * @returns {FluxibleContext}
 */
Fluxible.prototype.createContext = function createContext(options) {
    var self = this;
    options = options || {};
    options.app = self;
    var context = new FluxibleContext(options);

    // Plug context with app plugins that implement plugContext method
    this._plugins.forEach(function eachPlugin(plugin) {
        if (plugin.plugContext) {
            var contextPlugin = plugin.plugContext(options, context, self);
            contextPlugin.name = contextPlugin.name || plugin.name;
            context.plug(contextPlugin);
        }
    });

    return context;
};

/**
 * The default component action handler
 * @method defaultComponentActionHandler
 * @private
 */
Fluxible.prototype._defaultComponentActionHandler = function defaultComponentActionHandler(context, payload, done) {
    if (payload.err) {
        debug('Action returned error', payload.err);
        throw payload.err;
    }
    done();
};

/**
 * Creates a new dispatcher instance using the application's dispatchr class. Used by
 * FluxibleContext to create new dispatcher instance
 * @method createDispatcherInstance
 * @param {Object} contextOptions The context options to be provided to each store instance
 * @returns {Dispatcher}
 */
Fluxible.prototype.createDispatcherInstance = function createDispatcherInstance(contextOptions) {
    return this._dispatcher.createContext(contextOptions);
};

/**
 * Provides plugin mechanism for adding application level settings that are persisted
 * between server/client and also modification of the FluxibleContext
 * @method plug
 * @param {Object} plugin
 * @param {String} plugin.name Name of the plugin
 * @param {Function} plugin.plugContext Method called after context is created to allow
 *  dynamically plugging the context
 * @param {Object} [plugin.dehydrate] Method called to serialize the plugin settings to be persisted
 *  to the client
 * @param {Object} [plugin.rehydrate] Method called to rehydrate the plugin settings from the server
 */
Fluxible.prototype.plug = function (plugin) {
    if (!plugin.name) {
        throw new Error('Application plugin must have a name');
    }
    this._plugins.push(plugin);
};

/**
 * Provides access to a plugin instance by name
 * @method getPlugin
 * @param {String} pluginName The plugin name
 * @returns {Object}
 */
Fluxible.prototype.getPlugin = function (pluginName) {
    var plugin = null;
    this._plugins.forEach(function (p) {
        if (pluginName === p.name) {
            plugin = p;
        }
    });
    return plugin;
};

/**
 * Getter for the top level react component for the application
 * @method getComponent
 * @returns {Object}
 */
Fluxible.prototype.getComponent = function getComponent() {
    return this._component;
};

/**
 * Registers a store to the dispatcher so it can listen for actions
 * @method registerStore
 */
Fluxible.prototype.registerStore = function registerStore() {
    debug(arguments[0].storeName + ' store registered');
    this._dispatcher.registerStore.apply(this._dispatcher, arguments);
};

/**
 * Creates a serializable state of the application and a given context for sending to the client
 * @method dehydrate
 * @param {FluxibleContext} context
 * @returns {Object} Dehydrated state object
 */
Fluxible.prototype.dehydrate = function dehydrate(context) {
    debug('dehydrate', context);
    var self = this;
    var state = {
        context: context.dehydrate(),
        plugins: {}
    };

    this._plugins.forEach(function (plugin) {
        if ('function' === typeof plugin.dehydrate) {
            // Use a namespace for storing plugin state and provide access to the application
            state.plugins[plugin.name] = plugin.dehydrate(self);
        }
    });

    return state;
};

/**
 * Rehydrates the application and creates a new context with the state from the server
 * @method rehydrate
 * @param {Object} obj Raw object of dehydrated state
 * @param {Object} obj.plugins Dehydrated app plugin state
 * @param {Object} obj.context Dehydrated context state
 * @param {Function} callback
 * @async Rehydration may require more asset loading or async IO calls
 */
Fluxible.prototype.rehydrate = function rehydrate(obj, callback) {
    debug('rehydrate', obj);
    var self = this;
    var Promise = Fluxible.Promise;
    obj.plugins = obj.plugins || {};
    var pluginTasks = self._plugins.filter(function (plugin) {
        return 'function' === typeof plugin.rehydrate;
    }).map(function (plugin) {
        return new Promise(function (resolve, reject) {
            var result = plugin.rehydrate(obj.plugins[plugin.name], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            if (isPromise(result)) {
                result.then(resolve, reject);
            } else if (plugin.rehydrate.length < 2) {
                resolve();
            }
        });
    });

    var context = self.createContext();
    var rehydratePromise = Promise.all(pluginTasks).then(function rehydratePluginTasks() {
        return context.rehydrate(obj.context);
    });

    if (callback) {
        rehydratePromise
            .then(function(context) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(callback, null, context);
            }, function (err) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(callback, err);
            });
    }

    return rehydratePromise;
};

module.exports = Fluxible;
