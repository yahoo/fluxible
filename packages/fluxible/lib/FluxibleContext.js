/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Fluxible:Context');
var isPromise = require('is-promise');
var generateUUID = require('../utils/generateUUID');
var EventEmitter = require('eventemitter3');
var inherits = require('inherits');

var __DEV__ = process.env.NODE_ENV !== 'production';
require('setimmediate');

/**
 * A request or browser-session context
 * @class FluxibleContext
 * @param {Fluxible} app The Fluxible instance used to create the context
 * @constructor
 */
function FluxContext(app) {
    this._app = app;

    // To be created on demand
    this._dispatcher = null;

    // Plugins
    this._plugins = [];

    // Set up contexts
    this._actionContext = null;
    this._componentContext = null;
    this._storeContext = null;
}

inherits(FluxContext, EventEmitter);

var warnedOnce = false;

/**
 * Getter for the app's component. Pass through to the Fluxible instance.
 * @method getComponent
 * @returns {ReactComponent}
 */
FluxContext.prototype.getComponent = function getComponent() {
    return this._app.getComponent();
};

/**
 * Getter for store from dispatcher
 * @method getStore
 * @returns {Object}
 */
FluxContext.prototype.getStore = function getStore(store) {
    if (!this._dispatcher) {
        this._initializeDispatcher();
    }
    return this._dispatcher.getStore(store);
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
 * Executes an action, and calls either resolve or reject based on the callback result
 * This is extracted from FluxContext.prototype.executeAction to prevent this method de-optimising
 * due to the try/catch
 * @param {Object} actionContext FluxContext object
 * @param {Function} action Action to call
 * @param {Object} payload Payload for the action
 * @private
 */
function callAction(actionContext, action, payload) {
    return new Promise(function (resolve, reject) {
        setImmediate(function () {
            try {
                var syncResult = action(actionContext, payload, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
                if (isPromise(syncResult)) {
                    syncResult.then(resolve, reject);
                } else if (action.length < 3) {
                    resolve(syncResult);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

/**
 * Executes an action passing an action interface to as the first parameter
 * If a promise is returned by the action, it will wait for its resolution or rejection
 * If the action has less than three parameters, the returned promise
 * will be resolved with the return value
 * If the action throws an error, the promise will be rejected with the thrown value
 * @param {Object} context The current FluxibleContext
 * @param {Object} actionContext The current action context
 * @param {Function} action An action creator function that receives actionContext, payload,
 *  and done as parameters
 * @param {Object} payload The action payload
 * @param {Function} [done] Method to be called once action execution has completed
 * @return {Promise} executeActionPromise Resolved with action result or rejected with action error
 */
function executeActionProxy(context, actionContext, action, payload, done) {
    var displayName = action.displayName || action.name;
    payload = (undefined !== payload) ? payload : {};
    if (__DEV__) {
        if (!action) {
            throw new Error('executeAction called with an invalid action. Action ' +
                'must be a function.');
        }
        if (context._dispatcher && context._dispatcher.currentAction) {
            var currentActionDisplayName = context._dispatcher.currentAction.displayName ||
                context._dispatcher.currentAction.name;

            console.warn('Warning: executeAction for `' + displayName + '` was called, but `' +
                currentActionDisplayName + '` is currently being dispatched. This could mean ' +
                'there are cascading updates, which should be avoided. `' + displayName +
                '` will only start after `' + currentActionDisplayName + '` is complete.');
        }
    }

    if (debug.enabled) {
        debug('Executing action ' + actionContext.stack.join('.') + ' with payload', payload);
    }

    var emitPayload = {
        name: displayName,
        rootId: actionContext.rootId,
        stack: actionContext.stack
    };
    context.emit('executeAction.start', emitPayload);
    function emitEnd() {
        context.emit('executeAction.end', emitPayload);
    }
    var executeActionPromise = callAction(actionContext, action, payload).then(
        function (v) {
            emitEnd();
            return v;
        },
        function (e) {
            emitEnd();
            throw e;
        });

    if (done) {
        executeActionPromise
            .then(function(result) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(done, null, result);
            }, function (err) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(done, err);
            });
    }

    return executeActionPromise;
}

/**
 * Proxy function for executing an action.
 * @param {Function} action An action creator function that receives actionContext, payload,
 *  and done as parameters
 * @param {Object} payload The action payload
 * @param {Function} [done] Method to be called once action execution has completed
 * @return {Promise} executeActionPromise Resolved with action result or rejected with action error
 */
FluxContext.prototype.executeAction = function executeAction(action, payload, done) {
    var subActionContext = this._createSubActionContext(this.getActionContext(), action);
    return executeActionProxy(this, subActionContext, action, payload, done);
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
 * Creates a subActionContext with new stack and rootID based on the action
 * that will be executed.
 * @private
 * @method _createSubActionContext
 * @param {Object} parentActionContext The action context that the stack should
 *      extend from
 * @param {Function} action The action to be executed to get the name from
 * @returns {Object}
 */
FluxContext.prototype._createSubActionContext = function createSubActionContext(parentActionContext, action) {
    var displayName = action.displayName || action.name;
    /*
     * We store the action's stack array on the `stack` property
     * of the actionContext interface.
     * You can access this in your actions with `context.stack`.
     * Use the `displayName` property on your actions for better
     * action tracing when your code gets minified in prod.
     * One action can execute multiple actions, so we need to create a shallow
     * clone with a new stack & new id every time a newActionContext is created.
     */
    var newActionContext = Object.assign({}, this.getActionContext(), {
        stack: (parentActionContext.stack || []).concat([displayName]),
        rootId: (parentActionContext.rootId) || generateUUID()
    });
    newActionContext.executeAction = newActionContext.executeAction.bind(newActionContext);
    return newActionContext;
};

/**
 * Returns the context for action controllers
 * @method getActionContext
 * @return {Object} Action context information
 */
FluxContext.prototype.getActionContext = function getActionContext() {
    var self = this;

    if (!self._actionContext) {
        if (!self._dispatcher) {
            self._initializeDispatcher();
        }

        var actionContext = {
            dispatch: self._dispatcher.dispatch.bind(self._dispatcher),
            executeAction: function executeAction (action, payload, callback) {
                // `this` will be the current action context
                var subActionContext = self._createSubActionContext(this, action);
                return executeActionProxy(self, subActionContext, action, payload, callback);
            },
            getStore: self._dispatcher.getStore.bind(self._dispatcher)
        };

        self._plugins.forEach(function pluginsEach(plugin) {
            var actionContextPlugin = plugin.plugActionContext;
            if (actionContextPlugin) {
                actionContextPlugin(actionContext, self, self._app);
            }
        });

        self._actionContext = actionContext;
    }

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
        executeAction: function componentExecuteAction(action, payload, done) {
            if (done) {
                if (__DEV__) {
                    console.warn('When calling executeAction from a component,' +
                        'a callback isn\'t allowed. See our docs for more info:' +
                        'http://fluxible.io/api/components.html#component-context');
                }
            }
            self.executeAction(action, payload)
            ['catch'](function actionHandlerWrapper(err) {
                return self.executeAction(self._app._componentActionErrorHandler, { err: err });
            })
            ['catch'](function unhandledError(err) {
                setImmediate(function () {
                    throw err;
                });
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

    return Promise.all(pluginTasks).then(function rehydratePluginTasks() {
        self._dispatcher = self._app.createDispatcherInstance(self.getStoreContext());
        self._dispatcher.rehydrate(obj.dispatcher || {});
        return self;
    });
};

module.exports = FluxContext;
