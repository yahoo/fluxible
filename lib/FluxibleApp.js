/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('FluxibleApp');
var async = require('async');
var FluxibleContext = require('./FluxibleContext');
var dispatcherClassFactory = require('dispatchr');

/**
 * Provides a structured way of registering an application's configuration and
 * resources.
 * @class FluxibleApp
 * @param {Object} [options]
 * @param {Object} [options.appComponent] The root application component
 * @param {String} [options.pathPrefix] The path used for application calls
 * @constructor
 *
 * @example
 *      var app = new FluxibleApp({
 *          appComponent: require('./components/App.jsx'),
 *          plugins: [
 *              require('./plugins/Foo')
 *          ]
 *      });
 */
function FluxibleApp(options) {
    debug('FluxibleApp instance instantiated', options);
    options = options || {};

    // Options
    this._appComponent = options.appComponent;
    this._plugins = [];

    // Initialize dependencies
    this._dispatcherClass = dispatcherClassFactory();
}

/**
 * Creates an isolated context for a request/session
 * @method createContext
 * @param {Object} [options]
 * @returns {FluxibleContext}
 */
FluxibleApp.prototype.createContext = function createContext(options) {
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
 * Creates a new dispatcher instance using the application's dispatchr class. Used by
 * FluxibleContext to create new dispatcher instance
 * @method createDispatcherInstance
 * @param {Object} context The context object to be provided to each store instance
 * @returns {Dispatcher}
 */
FluxibleApp.prototype.createDispatcherInstance = function createDispatcherInstance(context) {
    return new (this._dispatcherClass)(context);
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
FluxibleApp.prototype.plug = function (plugin) {
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
FluxibleApp.prototype.getPlugin = function (pluginName) {
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
 * @method getAppComponent
 * @returns {Object}
 */
FluxibleApp.prototype.getAppComponent = function getAppComponent() {
    return this._appComponent;
};

/**
 * Registers a store to the dispatcher so it can listen for actions
 * @method registerStore
 */
FluxibleApp.prototype.registerStore = function registerStore() {
    debug(arguments[0].storeName + ' store registered');
    this._dispatcherClass.registerStore.apply(this._dispatcherClass, arguments);
};

/**
 * Creates a serializable state of the application and a given context for sending to the client
 * @method dehydrate
 * @param {FluxibleContext} context
 * @returns {Object} Dehydrated state object
 */
FluxibleApp.prototype.dehydrate = function dehydrate(context) {
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
FluxibleApp.prototype.rehydrate = function rehydrate(obj, callback) {
    debug('rehydrate', obj);
    var self = this;
    obj.plugins = obj.plugins || {};
    var pluginTasks = this._plugins.filter(function (plugin) {
        return 'function' === typeof plugin.rehydrate;
    }).map(function (plugin) {
        return function (asyncCallback) {
            if (2 === plugin.rehydrate.length) { // Async plugin
                plugin.rehydrate(obj.plugins[plugin.name], asyncCallback);
            } else { // Sync plugin
                try {
                    plugin.rehydrate(obj.plugins[plugin.name]);
                } catch (e) {
                    asyncCallback(e);
                    return;
                }
                asyncCallback();
            }
        };
    });

    async.parallel(pluginTasks, function rehydratePluginTasks(err) {
        if (err) {
            callback(err);
            return;
        }
        var context = self.createContext();
        context.rehydrate(obj.context);
        callback(null, context);
    });
};

module.exports = FluxibleApp;
