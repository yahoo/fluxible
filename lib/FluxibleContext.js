/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Fluxible:Context');
var objectAssign = require('object-assign');
var React = require('react');
var FluxibleComponent = React.createFactory(require('./FluxibleComponent'));
require('setimmediate');

/**
 * A request or browser-session context
 * @class FluxibleContext
 * @param {Object} options
 * @param {Fluxible} options.app The Fluxible instance used to create the context
 * @constructor
 */
function FluxContext(options) {
    options = options || {};

    // Options
    this._app = options.app;

    // To be created on demand
    this._dispatcher = null;

    // Plugins
    this._plugins = [];

    // Set up contexts
    this._actionContext = null;
    this._componentContext = null;
    this._storeContext = null;
}

/**
 * Creates an instance of the app level component with given props and a proper component
 * context.
 * @param {Object} props
 * @return {ReactElement}
 */
FluxContext.prototype.createElement = function createElement(props) {
    var Component = this._app.getComponent();
    if (!Component) {
        throw new Error('A component was not specified.');
    }
    return FluxibleComponent({
        context: this.getComponentContext()
    }, Component(props));
};

/**
 * Provides plugin mechanism for adding application level settings that are persisted
 * between server/client and also modification of the FluxibleContext
 * @method plug
 * @param {Object} plugin
 * @param {String} plugin.name Name of the plugin
 * @param {Function} [plugin.plugActionContext] Method called after action context is created to allow
 *  dynamically modifying the action context
 * @param {Function} [plugin.plugComponentContext] Method called after component context is created to
 *  allow dynamically modifying the component context
 * @param {Function} [plugin.plugStoreContext] Method called after store context is created to allow
 *  dynamically modifying the store context
 * @param {Object} [plugin.dehydrate] Method called to serialize the plugin settings to be persisted
 *  to the client
 * @param {Object} [plugin.rehydrate] Method called to rehydrate the plugin settings from the server
 */
FluxContext.prototype.plug = function (plugin) {
    if (!plugin.name) {
        throw new Error('Context plugin must have a name');
    }
    this._plugins.push(plugin);
};

/**
 * Executes an action passing an action interface to as the first parameter
 * @param {Function} action An action creator function that receives actionContext, payload,
 *  and done as parameters
 * @param {Object} payload The action payload
 * @param {Function} done Method to be called once action execution has completed
 */
FluxContext.prototype.executeAction = function executeAction(action, payload, done) {
    var self = this;
    payload = payload || {};
    var displayName = action.displayName || action.name;
    setImmediate(function executeActionImmediate() {
        debug('Executing action ' + displayName + ' with payload', payload);
        action(self.getActionContext(), payload, done);
    });
};

/**
 * Sets up the dispatcher with access to the store context
 * @method _initializeDispatcher
 * @private
 */
FluxContext.prototype._initializeDispatcher = function initializeDispatcher() {
    this._dispatcher = this._app.createDispatcherInstance(this.getStoreContext());
};

/**
 * Returns the context for action controllers
 * @method getActionContext
 * @return {Object} Action context information
 */
FluxContext.prototype.getActionContext = function getActionContext() {
    if (this._actionContext) {
        return this._actionContext;
    }
    var self = this;

    if (!self._dispatcher) {
        self._initializeDispatcher();
    }

    var actionContext = {
        dispatch: this._dispatcher.dispatch.bind(this._dispatcher),
        executeAction: this.executeAction.bind(this),
        getStore: this._dispatcher.getStore.bind(this._dispatcher)
    };

    self._plugins.forEach(function pluginsEach(plugin) {
        var actionContextPlugin = plugin.plugActionContext;
        if (actionContextPlugin) {
            actionContextPlugin(actionContext, self, self._app);
        }
    });

    self._actionContext = actionContext;

    return self._actionContext;
};

/**
 * Returns the context for action controllers
 * @method getComponentContext
 * @return {Object} Component context information
 */
FluxContext.prototype.getComponentContext = function getComponentContext() {
    if (this._componentContext) {
        return this._componentContext;
    }
    var self = this;
    if (!self._dispatcher) {
        self._initializeDispatcher();
    }

    var componentContext = {
        getStore: this._dispatcher.getStore.bind(this._dispatcher),
        // Prevents components from directly handling the callback for an action
        executeAction: function componentExecuteAction(action, payload) {
            self.executeAction(action, payload, function actionHandlerWrapper(err) {
                var noop = function () {};
                self.executeAction(self._app._componentActionHandler, { err: err }, noop);
            });
        }
    };

    self._plugins.forEach(function pluginsEach(plugin) {
        var componentPlugin = plugin.plugComponentContext;
        if (componentPlugin) {
            componentPlugin(componentContext, self, self._app);
        }
    });

    self._componentContext = componentContext;
    return self._componentContext;
};

/**
 * Returns the context for stores
 * @method getStoreContext
 * @return {Object} Store context information
 */
FluxContext.prototype.getStoreContext = function getStoreContext() {
    if (this._storeContext) {
        return this._storeContext;
    }
    var self = this;
    var storeContext = {};

    self._plugins.forEach(function pluginsEach(plugin) {
        var storeContextPlugin = plugin.plugStoreContext;
        if (storeContextPlugin) {
            storeContextPlugin(storeContext, self, self._app);
        }
    });

    self._storeContext = storeContext;
    return self._storeContext;
};

/**
 * Returns a serializable context state
 * @method dehydrate
 * @return {Object} See rehydrate method for properties
 */
FluxContext.prototype.dehydrate = function dehydrate() {
    var self = this;
    var state = {
        dispatcher: (this._dispatcher && this._dispatcher.dehydrate()) || {},
        plugins: {}
    };

    self._plugins.forEach(function pluginsEach(plugin) {
        if ('function' === typeof plugin.dehydrate) {
            // Use a namespace for storing plugin state and provide access to the application
            state.plugins[plugin.name] = plugin.dehydrate(self);
        }
    });

    return state;
};

/**
 * Rehydrates the context state
 * @method rehydrate
 * @param {Object} obj Configuration
 * @param {Object} obj.plugins Dehydrated context plugin state
 * @param {Object} obj.dispatcher Dehydrated dispatcher state
 */
FluxContext.prototype.rehydrate = function rehydrate(obj) {
    var self = this;
    obj.plugins = obj.plugins || {};
    self._plugins.forEach(function pluginsEach(plugin) {
        if ('function' === typeof plugin.rehydrate) {
            // Send in the plugin namespace state and provide access to the application instance
            plugin.rehydrate(obj.plugins[plugin.name], self);
        }
    });

    self._dispatcher = this._app.createDispatcherInstance(self.getStoreContext());
    self._dispatcher.rehydrate(obj.dispatcher || {});
};

module.exports = FluxContext;
