/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Fluxible:Context');
var objectAssign = require('object-assign');
var isPromise = require('is-promise');
var PromiseLib = global.Promise || require('es6-promise').Promise;
var React = require('react');
var FluxibleComponent = require('../addons/FluxibleComponent');
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

    // Book-keeping for actions
    this.executingActions = 0;
}

// Provied a way to override Promise only for FluxContext
FluxContext.Promise = PromiseLib;

/**
 * Creates an instance of the app level component with given props and a proper component
 * context.
 * @param {Object} props
 * @return {ReactElement}
 */
FluxContext.prototype.createElement = function createElement(props) {
    var component = this._app.getComponent();
    if (!component) {
        throw new Error('A component was not specified.');
    }
    if ('ContextProvider' === component.displayName) {
        return React.createElement(component, objectAssign({}, {
            context: this.getComponentContext()
        }, props));
    }
    var componentInstance;
    if (!component.hasOwnProperty('prototype')) {
        // TODO: remove factory support
        if ('production' !== process.env.NODE_ENV) {
            console.warn('When using context.createFactory(), it is no longer ' +
                'necessary to wrap your component with `React.createFactory` when ' +
                'instantiating Fluxible. Support for factories will be removed ' +
                'in the next version of Fluxible.');
        }
        componentInstance = component(props);
    } else {
        componentInstance = React.createElement(component, props);
    }
    return React.createElement(FluxibleComponent, {
        context: this.getComponentContext()
    }, componentInstance);
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
 * @param {Object} context FluxContext object
 * @param {Function} action Action to call
 * @param {Object} payload Payload for the action
 * @param {Function} resolve function to call on success
 * @param {Function} reject function to call on failure
 * @private
 */
function executeActionInternal(context, action, payload, resolve, reject) {
    var syncResult = action(context.getActionContext(), payload, function (err, result) {
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
}

/**
 * Executes an action passing an action interface to as the first parameter
 * If a promise is returned by the action, it will wait for its resolution or rejection
 * If the action has less than three parameters, the returned promise
 * will be resolved with the return value
 * If the action throws an error, the promise will be rejected with the thrown value
 * @param {Function} action An action creator function that receives actionContext, payload,
 *  and done as parameters
 * @param {Object} payload The action payload
 * @param {Function} [done] Method to be called once action execution has completed
 * @return {Promise} executeActionPromise Resolved with action result or rejected with action error
 */
FluxContext.prototype.executeAction = function executeAction(action, payload, done) {
    var self = this;
    payload = (undefined !== payload) ? payload : {};
    var displayName = action.displayName || action.name;
    var Promise = FluxContext.Promise;
    if (process.env.NODE_ENV !== 'production') {
        if (this._dispatcher && this._dispatcher.currentAction) {
            var currentActionDisplayName = this._dispatcher.currentAction.displayName ||
                this._dispatcher.currentAction.name;

            console.warn('Warning: executeAction for `' + displayName + '` was called, but `' +
                currentActionDisplayName + '` is currently being dispatched. This could mean ' +
                'there are cascading updates, which should be avoided. `' + displayName +
                '` will only start after `' + currentActionDisplayName + '` is complete.');
        }
    }

    var executeActionPromise = new Promise(function executeActionPromise(resolve, reject) {
        debug('Executing action ' + displayName + ' with payload', payload);
        setImmediate(function () {
            try {
                executeActionInternal(self, action, payload, resolve, reject);
            } catch (err) {
                reject(err);
            }
        });
    });

    executeActionPromise
      .then(function(result) {
          this.executingActions--;
          // Ensures that errors in callback are not swallowed by promise
          setImmediate(done || function () {}, null, result);
      }.bind(this), function (err) {
          this.executingActions--;
          // Ensures that errors in callback are not swallowed by promise
          setImmediate(done || function () {}, err);
      }.bind(this));

    return executeActionPromise;
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
        getStore: this._dispatcher.getStore.bind(this._dispatcher),
        storesLoaded: this.storesLoadedRecursive.bind(this)
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
 * Verify that all stores are loaded; render component; make sure all stores are loaded again.
 * @method storesLoadedRecursive
 * @param {Function} Callback once all stores have completed loading, including after a render cycle.
 */
FluxContext.prototype.storesLoadedRecursive = function storesLoadedRecursive(cb, iterations) {
    var maxIterations = 5;

    iterations = iterations || 0;

    if (iterations > maxIterations) {
        debug('bailing out after ' + iterations + ' iterations');
        return cb();
    }

    // Attempt to render - this could trigger more actions that we want to respond to before
    //  sending HTML to the client.
    React.renderToString(this.createElement());

    return setImmediate(function () {
        return this._dispatcher.storesLoaded(function (err, stabilized) {
            // Increment iteration counter to make sure that we don't get stuck in an infinite loop.
            // If we know that we are currently executing an act, we penalize that less since we don't actually
            // get a callback for actions executing/finishing in this class, only stores being marked loaded by the dispatcher.
            var incrementCounter = (this.executingActions > 0 ? 0.1 : (stabilized ? 1 : 0));
            if (incrementCounter !== 0) {
                return setImmediate(function () {
                    return this.storesLoadedRecursive(cb, iterations+incrementCounter);
                }.bind(this))
            }

            return cb();
        }.bind(this));
    }.bind(this));
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
                if ('production' !== process.env.NODE_ENV) {
                    console.warn('When calling executeAction from a component,' +
                        'a callback isn\'t allowed. See our docs for more info:' +
                        'http://fluxible.io/api/components.html#component-context');
                }
            }
            self.executeAction(action, payload)
            ['catch'](function actionHandlerWrapper(err) {
                return self.executeAction(self._app._componentActionHandler, { err: err });
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
    var Promise = FluxContext.Promise;
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

    return Promise.all(pluginTasks).then(function rehydratePluginTasks() {
        self._dispatcher = self._app.createDispatcherInstance(self.getStoreContext());
        self._dispatcher.rehydrate(obj.dispatcher || {});
        return self;
    });
};

module.exports = FluxContext;
