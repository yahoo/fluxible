/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Fluxible');
var isPromise = require('is-promise');
var FluxibleContext = require('./FluxibleContext');
var dispatchr = require('dispatchr');
var promiseCallback = require('../utils/promiseCallback');
var __DEV__ = process.env.NODE_ENV !== 'production';

/*
 * The default component action handler
 * @method defaultComponentActionHandler
 */
function defaultComponentActionHandler(context, payload, done) {
    if (payload.err) {
        debug('Action returned error', payload.actionName, payload.err);
        throw payload.err;
    }
    done();
}

/**
 * Provides a structured way of registering an application's configuration and
 * resources.
 * @class Fluxible
 * @param {Object} [options]
 * @param {Object} [options.component] Stores your top level React component for access using `getComponent()`
 * @param {Function} [options.componentActionErrorHandler] App level component action handler
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
    this._componentActionErrorHandler =
        options.componentActionErrorHandler || defaultComponentActionHandler;
    this._plugins = [];

    // Initialize dependencies
    this._dispatcher = dispatchr.createDispatcher(options);
}

/**
 * Creates an isolated context for a request/session
 * @method createContext
 * @param {Object} [options] The options object.  Please refer to FluxibleContext's constructor
 *         doc for supported subfields and detailed description.
 * @returns {FluxibleContext}
 */
Fluxible.prototype.createContext = function createContext(options) {
    var self = this;
    options = options || {};
    var context = new FluxibleContext(self, options);

    // Plug context with app plugins that implement plugContext method
    this._plugins.forEach(function eachPlugin(plugin) {
        if (plugin.plugContext) {
            var contextPlugin = plugin.plugContext(options, context, self) || {};
            contextPlugin.name = contextPlugin.name || plugin.name;
            context.plug(contextPlugin);
        }
    });

    return context;
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
    if (__DEV__) {
        if (!plugin.name) {
            throw new Error('Application plugin must have a name');
        }
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
 * @returns {ReactComponent}
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
 * @param {Object} obj.context Dehydrated context state. See FluxibleContext's
 *                 rehydrate() for subfields in this object.
 * @param {Function} callback
 * @async Rehydration may require more asset loading or async IO calls
 */
Fluxible.prototype.rehydrate = function rehydrate(obj, callback) {
    debug('rehydrate', obj);
    var self = this;
    if (__DEV__) {
        if (typeof obj !== 'object') {
            throw new Error('`rehydrate` called with a non-object. Ensure ' +
                'that the parameter passed to rehydrate is a state object ' +
                'produced by a dehydrate call.');
        }
    }
    obj.plugins = obj.plugins || {};
    var pluginTasks = self._plugins.filter(function (plugin) {
        return 'function' === typeof plugin.rehydrate
            && obj.plugins[plugin.name];
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

    var context = self.createContext(obj.context && obj.context.options);
    var rehydratePromise = Promise.all(pluginTasks).then(function rehydratePluginTasks() {
        return context.rehydrate(obj.context || {});
    });

    if (callback) {
        promiseCallback(rehydratePromise, callback, {optimize: true});
    }

    return rehydratePromise;
};

module.exports = Fluxible;
